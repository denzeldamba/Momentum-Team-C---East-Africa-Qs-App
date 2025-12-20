import { IndexedDBManager } from "../lib/offline/indexedDB";
import { SyncQueueManager } from "../lib/offline/sync-queue";
import type { Calibration } from "../lib/types/db";

const db = new IndexedDBManager();
const queue = new SyncQueueManager(db);

export const CalibrationsService = {
	async create(
		calibration: Omit<Calibration, "id" | "created_at" | "updated_at">
	) {
		const newCal: Calibration = {
			...calibration,
			id: crypto.randomUUID(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		await db.put("calibrations", newCal);
		await queue.add({
			table_name: "calibrations",
			record_id: newCal.id,
			operation: "insert",
			data: newCal,
		});

		return newCal;
	},

	async update(id: string, updates: Partial<Calibration>) {
		const cal = await db.get<Calibration>("calibrations", id);
		if (!cal) return null;

		const updated = {
			...cal,
			...updates,
			updated_at: new Date().toISOString(),
		};
		await db.put("calibrations", updated);
		await queue.add({
			table_name: "calibrations",
			record_id: id,
			operation: "update",
			data: updated,
		});

		return updated;
	},

	async delete(id: string) {
		await queue.add({
			table_name: "calibrations",
			record_id: id,
			operation: "delete",
		});

		const cal = await db.get<Calibration>("calibrations", id);
		if (!cal) return;
		await db.put("calibrations", {
			...cal,
			deleted_at: new Date().toISOString(),
		});
	},

	async getAll(): Promise<Calibration[]> {
		const all = await db.getAll<Calibration>("calibrations");
		return all.filter((c) => !c.deleted_at);
	},
};
