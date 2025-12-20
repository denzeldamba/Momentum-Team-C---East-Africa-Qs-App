import { IndexedDBManager } from "./indexedDB";
import { SyncQueueManager } from "./sync-queue";
import { insertRecord, updateRecord, deleteRecord } from "../supabase/tables";

/**
 * Handles syncing pending operations from IndexedDB to Supabase
 */
export class SyncEngine {
	private db = new IndexedDBManager();
	private queue = new SyncQueueManager(this.db);
	private isSyncing = false;

	async initialize(): Promise<void> {
		await this.db.initialize();
		window.addEventListener("online", () => this.run());
	}

	async run(): Promise<void> {
		if (!navigator.onLine || this.isSyncing) return;

		this.isSyncing = true;

		try {
			const pending = await this.queue.getPending();

			for (const op of pending) {
				try {
					switch (op.operation) {
						case "insert":
							await insertRecord(op.table_name, op.data);
							break;
						case "update":
							await updateRecord(
								op.table_name,
								op.record_id,
								op.data
							);
							break;
						case "delete":
							await deleteRecord(op.table_name, op.record_id);
							break;
					}

					await this.queue.markSynced(op.id);
				} catch (err: any) {
					await this.queue.markFailed(op.id, err.message);
				}
			}
		} finally {
			this.isSyncing = false;
		}
	}
}
