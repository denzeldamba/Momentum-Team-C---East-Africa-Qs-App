import { db } from "../OfflineDb";
import type { Project } from "../OfflineDb";

export async function createProject(project: Project) {
  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    await db.projects.put(project);

    await db.pendingSync.add({
      table: "projects",
      operation: "insert",
      payload: project,
      created_at: Date.now(),
    });
  });
}

export async function updateProject(project: Project) {
  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    await db.projects.put(project);

    await db.pendingSync.add({
      table: "projects",
      operation: "update",
      payload: project,
      created_at: Date.now(),
    });
  });
}

export async function deleteProject(id: string) {
  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    await db.projects.delete(id);

    await db.pendingSync.add({
      table: "projects",
      operation: "delete",
      payload: { id },
      created_at: Date.now(),
    });
  });
}

export async function getProjects() {
  return await db.projects.orderBy("updated_at").reverse().toArray();
}
