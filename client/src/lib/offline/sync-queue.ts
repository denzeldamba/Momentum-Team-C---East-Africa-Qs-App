import type { SyncQueue } from "../types/db";
import { IndexedDBManager } from "./indexedDB";

export class SyncQueueManager {
	constructor(private db: IndexedDBManager) {}

	async add(
		operation: Omit<SyncQueue, "id" | "created_at" | "synced_at">
	): Promise<void> {
		const queueItem: SyncQueue = {
			...operation,
			id: crypto.randomUUID(),
			created_at: new Date().toISOString(),
			synced_at: null,
			retry_count: 0,
			sync_status: "pending",
		};

		await this.db.put("syncQueue", queueItem);
	}

	async getPending(): Promise<SyncQueue[]> {
		const all = await this.db.getAll<SyncQueue>("syncQueue");
		return all.filter((item) => item.sync_status === "pending");
	}

	async markSynced(id: string): Promise<void> {
		const item = await this.db.get<SyncQueue>("syncQueue", id);
		if (!item) return;
		item.sync_status = "synced";
		item.synced_at = new Date().toISOString();
		await this.db.put("syncQueue", item);
	}

	async markFailed(id: string, errorMessage: string): Promise<void> {
		const item = await this.db.get<SyncQueue>("syncQueue", id);
		if (!item) return;
		item.sync_status = "failed";
		item.retry_count += 1;
		item.error_message = errorMessage;
		await this.db.put("syncQueue", item);
	}
}
