import { IndexedDBManager } from "../lib/offline/indexedDB";
import { SyncQueueManager } from "../lib/offline/sync-queue";
import type { Calibration } from "../lib/types/db";

const db = new IndexedDBManager();
const queue = new SyncQueueManager(db);

// TEMP: until auth is wired
const SYSTEM_USER_ID = "offline-user";

export const CalibrationsService = {
	async create(
		calibration: Omit<Calibration, "id" | "created_at">
	): Promise<Calibration> {
		const newCal: Calibration = {
			...calibration,
			id: crypto.randomUUID(),
			created_at: new Date().toISOString(),
		};

		await db.put("calibrations", newCal);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "calibrations",
			record_id: newCal.id,
			operation: "insert",
			data: newCal,
			sync_status: "pending",
			retry_count: 0,
		});

		return newCal;
	},

	async update(
		id: string,
		updates: Partial<Omit<Calibration, "id" | "created_at">>
	): Promise<Calibration | null> {
		const cal = await db.get<Calibration>("calibrations", id);
		if (!cal) return null;

		const updated: Calibration = {
			...cal,
			...updates,
		};

		await db.put("calibrations", updated);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "calibrations",
			record_id: id,
			operation: "update",
			data: updated,
			sync_status: "pending",
			retry_count: 0,
		});

		return updated;
	},

	async delete(id: string): Promise<void> {
		const cal = await db.get<Calibration>("calibrations", id);
		if (!cal) return;

		await db.delete("calibrations", id);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "calibrations",
			record_id: id,
			operation: "delete",
			sync_status: "pending",
			retry_count: 0,
		});
	},

	async getAll(): Promise<Calibration[]> {
		return await db.getAll<Calibration>("calibrations");
	},
};
