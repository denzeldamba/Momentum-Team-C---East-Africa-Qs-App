import { IndexedDBManager } from "../lib/offline/indexedDB";
import { SyncQueueManager } from "../lib/offline/sync-queue";
import { getPublicUrl, uploadFile } from "../lib/supabase/storage";
import type { Drawing } from "../lib/types/db";

const db = new IndexedDBManager();
const queue = new SyncQueueManager(db);

export const DrawingsService = {
	async create(
		projectId: string,
		drawingData: any,
		thumbnail?: Blob
	): Promise<Drawing> {
		const id = crypto.randomUUID();
		let thumbnailUrl: string | undefined;

		if (thumbnail && navigator.onLine) {
			const fileName = `${id}/thumbnail.png`;
			await uploadFile("drawings", fileName, thumbnail);
			thumbnailUrl = getPublicUrl("drawings", fileName);
		} else if (thumbnail) {
			await db.put("blobs", {
				id: `thumbnail-${id}`,
				recordId: id,
				blob: thumbnail,
				type: "thumbnail",
			});
		}

		const drawing: Drawing = {
			id,
			project_id: projectId,
			user_id: "", // Should get current user ID from auth context
			drawing_data: drawingData,
			thumbnail_url: thumbnailUrl,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		await db.put("drawings", drawing);
		await queue.add({
			table_name: "drawings",
			record_id: id,
			operation: "insert",
			data: drawing,
		});

		return drawing;
	},

	async update(
		id: string,
		updates: Partial<Drawing>
	): Promise<Drawing | null> {
		const drawing = await db.get<Drawing>("drawings", id);
		if (!drawing) return null;

		const updated = {
			...drawing,
			...updates,
			updated_at: new Date().toISOString(),
		};
		await db.put("drawings", updated);
		await queue.add({
			table_name: "drawings",
			record_id: id,
			operation: "update",
			data: updated,
		});

		return updated;
	},

	async delete(id: string): Promise<void> {
		await queue.add({
			table_name: "drawings",
			record_id: id,
			operation: "delete",
		});
		const drawing = await db.get<Drawing>("drawings", id);
		if (!drawing) return;
		const deleted = {
			...drawing,
			deleted_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		await db.put("drawings", deleted);
	},

	async getByProject(projectId: string): Promise<Drawing[]> {
		const drawings = await db.getAll<Drawing>(
			"drawings",
			"project_id",
			projectId
		);
		return drawings.filter((d) => !d.deleted_at);
	},
};
