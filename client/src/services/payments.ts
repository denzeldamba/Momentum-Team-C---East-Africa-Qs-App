import { IndexedDBManager } from "../lib/offline/indexedDB";
import { SyncQueueManager } from "../lib/offline/sync-queue";
import type { PaymentCertificate } from "../lib/types/db";

const db = new IndexedDBManager();
const queue = new SyncQueueManager(db);

export const PaymentsService = {
	async create(
		payment: Omit<PaymentCertificate, "id" | "created_at" | "updated_at">
	) {
		const newPayment: PaymentCertificate = {
			...payment,
			id: crypto.randomUUID(),
			created_at: new Date().toISOString(),
		};

		await db.put("payments", newPayment);
		await queue.add({
			table_name: "payments",
			record_id: newPayment.id,
			operation: "insert",
			data: newPayment,
		});

		return newPayment;
	},

	async update(id: string, updates: Partial<PaymentCertificate>) {
		const pay = await db.get<PaymentCertificate>("payments", id);
		if (!pay) return null;

		const updated: PaymentCertificate = {
			...pay,
			...updates,
			updated_at: new Date().toISOString(),
		};

		await db.put("payments", updated);
		await queue.add({
			table_name: "payments",
			record_id: id,
			operation: "update",
			data: updated,
		});

		return updated;
	},

	async delete(id: string) {
		await queue.add({
			table_name: "payments",
			record_id: id,
			operation: "delete",
		});

		const pay = await db.get<PaymentCertificate>("payments", id);
		if (!pay) return;

		await db.put("payments", {
			...pay,
			deleted_at: new Date().toISOString(),
		});
	},

	async getAll(): Promise<PaymentCertificate[]> {
		const all = await db.getAll<PaymentCertificate>("payments");
		return all.filter((p) => !p.deleted_at);
	},
};
