import { IndexedDBManager } from "../lib/offline/indexedDB";
import { SyncQueueManager } from "../lib/offline/sync-queue";
import type { PaymentCertificate } from "../lib/types/db";

const db = new IndexedDBManager();
const queue = new SyncQueueManager(db);

// temporary until auth context is wired
const SYSTEM_USER_ID = "offline-user";

export const PaymentsService = {
	async create(
		payment: Omit<PaymentCertificate, "id" | "created_at">
	): Promise<PaymentCertificate> {
		const newPayment: PaymentCertificate = {
			...payment,
			id: crypto.randomUUID(),
			created_at: new Date().toISOString(),
		};

		await db.put("payments", newPayment);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "payments",
			record_id: newPayment.id,
			operation: "insert",
			data: newPayment,
			sync_status: "pending",
			retry_count: 0,
		});

		return newPayment;
	},

	async update(
		id: string,
		updates: Partial<Omit<PaymentCertificate, "id" | "created_at">>
	): Promise<PaymentCertificate | null> {
		const pay = await db.get<PaymentCertificate>("payments", id);
		if (!pay) return null;

		const updated: PaymentCertificate = {
			...pay,
			...updates,
		};

		await db.put("payments", updated);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "payments",
			record_id: id,
			operation: "update",
			data: updated,
			sync_status: "pending",
			retry_count: 0,
		});

		return updated;
	},

	async delete(id: string): Promise<void> {
		const pay = await db.get<PaymentCertificate>("payments", id);
		if (!pay) return;

		await db.delete("payments", id);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "payments",
			record_id: id,
			operation: "delete",
			sync_status: "pending",
			retry_count: 0,
		});
	},

	async getAll(): Promise<PaymentCertificate[]> {
		return await db.getAll<PaymentCertificate>("payments");
	},
};
