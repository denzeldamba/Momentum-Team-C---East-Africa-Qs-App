import {
	insertRecord,
	updateRecord,
	deleteRecord,
	fetchRecords,
	fetchRecordById,
} from "../supabase/tables";
import { IndexedDBManager } from "../lib/offline/indexedDB";
import { SyncQueueManager } from "../lib/offline/sync-queue";
import type { Project } from "../lib/types/db";

const db = new IndexedDBManager();
const queue = new SyncQueueManager(db);

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
			table_name: "projects",
			record_id: newProject.id,
			operation: "insert",
			data: newProject,
		});

		if (navigator.onLine) {
			await insertRecord("projects", newProject);
			await queue.markSynced(newProject.id);
		}

		return newProject;
	},

	async update(
		id: string,
		updates: Partial<Project>
	): Promise<Project | null> {
		const project = await db.get<Project>("projects", id);
		if (!project) return null;

		const updatedProject = {
			...project,
			...updates,
			updated_at: new Date().toISOString(),
		};
		await db.put("projects", updatedProject);
		await queue.add({
			table_name: "projects",
			record_id: id,
			operation: "update",
			data: updatedProject,
		});

		if (navigator.onLine) {
			await updateRecord("projects", id, updatedProject);
			await queue.markSynced(id);
		}

		return updatedProject;
	},

	async delete(id: string): Promise<void> {
		await queue.add({
			table_name: "projects",
			record_id: id,
			operation: "delete",
		});
		const project = await db.get<Project>("projects", id);
		if (!project) return;

		const deletedProject = {
			...project,
			deleted_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};
		await db.put("projects", deletedProject);

		if (navigator.onLine) {
			await deleteRecord("projects", id);
			await queue.markSynced(id);
		}
	},

	async getAll(): Promise<Project[]> {
		const projects = await db.getAll<Project>("projects");
		return projects.filter((p) => !p.deleted_at);
	},

	async getById(id: string): Promise<Project | null> {
		return db.get<Project>("projects", id);
	},
};
