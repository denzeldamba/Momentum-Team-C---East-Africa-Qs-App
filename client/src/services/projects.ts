import { IndexedDBManager } from "../lib/offline/indexedDB";
import { SyncQueueManager } from "../lib/offline/sync-queue";
import {
	deleteRecord,
	insertRecord,
	updateRecord,
} from "../lib/supabase/tables";
import type { Project } from "../lib/types/db";

const db = new IndexedDBManager();
const queue = new SyncQueueManager(db);

// temporary until auth is wired
const SYSTEM_USER_ID = "offline-user";

export const ProjectsService = {
	async create(
		project: Omit<Project, "id" | "created_at" | "updated_at">
	): Promise<Project> {
		const newProject: Project = {
			...project,
			id: crypto.randomUUID(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		await db.put("projects", newProject);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "projects",
			record_id: newProject.id,
			operation: "insert",
			data: newProject,
			sync_status: "pending",
			retry_count: 0,
		});

		if (navigator.onLine) {
			await insertRecord("projects", newProject);
			await queue.markSynced(newProject.id);
		}

		return newProject;
	},

	async update(
		id: string,
		updates: Partial<Omit<Project, "id" | "created_at">>
	): Promise<Project | null> {
		const project = await db.get<Project>("projects", id);
		if (!project) return null;

		const updatedProject: Project = {
			...project,
			...updates,
			updated_at: new Date().toISOString(),
		};

		await db.put("projects", updatedProject);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "projects",
			record_id: id,
			operation: "update",
			data: updatedProject,
			sync_status: "pending",
			retry_count: 0,
		});

		if (navigator.onLine) {
			await updateRecord("projects", id, updatedProject);
			await queue.markSynced(id);
		}

		return updatedProject;
	},

	async delete(id: string): Promise<void> {
		const project = await db.get<Project>("projects", id);
		if (!project) return;

		await db.delete("projects", id);

		await queue.add({
			user_id: SYSTEM_USER_ID,
			table_name: "projects",
			record_id: id,
			operation: "delete",
			sync_status: "pending",
			retry_count: 0,
		});

		if (navigator.onLine) {
			await deleteRecord("projects", id);
			await queue.markSynced(id);
		}
	},

	async getAll(): Promise<Project[]> {
		return await db.getAll<Project>("projects");
	},

	async getById(id: string): Promise<Project | null> {
		return db.get<Project>("projects", id);
	},
};
