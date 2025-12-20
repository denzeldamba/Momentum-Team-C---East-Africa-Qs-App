import { IndexedDBManager } from "../lib/offline/indexedDB";
import { SyncQueueManager } from "../lib/offline/sync-queue";
import { getPublicUrl, uploadFile } from "../lib/supabase/storage";
import type { Drawing } from "../lib/types/db";

const db = new IndexedDBManager();
const queue = new SyncQueueManager(db);

// TEMP until auth is wired
const SYSTEM_USER_ID = "offline-user";

export const DrawingsService = {
	async create(projectId: string, file: File): Promise<Drawing> {
		const id = crypto.randomUUID();
		const filePath = `${id}/${file.name}`;

		let fileUrl: string | null = null;

		if (navigator.onLine) {
			await uploadFile("drawings", filePath, file);
			fileUrl = getPublicUrl("drawings", filePath);
		} else {
			await db.put("blobs", {
				id,
				record_id: id,
				blob: file,
				type: "drawing",
			});
		}

		const drawing: Drawing = {
			id,
			project_id: projectId,
			file_name: file.name,
			file_path: filePath,
			file_url: fileUrl,
			mime_type: file.type,
			file_size: file.size,
			page_count: 1,
			upload_date: new Date().toISOString(),
			created_at: new Date().toISOString(),
		};

		await db.put("drawings", drawing);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "drawings",
			record_id: id,
			operation: "insert",
			data: drawing,
			sync_status: "pending",
			retry_count: 0,
		});

		return drawing;
	},

	async update(
		id: string,
		updates: Partial<Omit<Drawing, "id" | "created_at">>
	): Promise<Drawing | null> {
		const drawing = await db.get<Drawing>("drawings", id);
		if (!drawing) return null;

		const updated: Drawing = {
			...drawing,
			...updates,
		};

		await db.put("drawings", updated);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "drawings",
			record_id: id,
			operation: "update",
			data: updated,
			sync_status: "pending",
			retry_count: 0,
		});

		return updated;
	},

	async delete(id: string): Promise<void> {
		const drawing = await db.get<Drawing>("drawings", id);
		if (!drawing) return;

		await db.delete("drawings", id);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "drawings",
			record_id: id,
			operation: "delete",
			sync_status: "pending",
			retry_count: 0,
		});
	},

	async getByProject(projectId: string): Promise<Drawing[]> {
		return await db.getAll<Drawing>("drawings", "project_id", projectId);
	},
};
