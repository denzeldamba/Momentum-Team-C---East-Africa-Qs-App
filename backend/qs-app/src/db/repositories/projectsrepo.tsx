import { db, type Project } from "../OfflineDb";

/* =========================================================
   CREATE PROJECT (OFFLINE-FIRST)
   ========================================================= */

export async function createProject(project: Project) {
  const now = Date.now();

  const newProject: Project = {
    ...project,
    updated_at: now,
  };

  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    await db.projects.put(newProject);

    await db.pendingSync.add({
      table: "projects",
      entity_id: newProject.id,
      operation: "insert",
      payload: newProject,
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   UPDATE PROJECT
   ========================================================= */

export async function updateProject(project: Project) {
  const now = Date.now();

  const updatedProject: Project = {
    ...project,
    updated_at: now,
  };

  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    await db.projects.put(updatedProject);

    await db.pendingSync.add({
      table: "projects",
      entity_id: updatedProject.id,
      operation: "update",
      payload: updatedProject,
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   DELETE PROJECT
   ========================================================= */

export async function deleteProject(id: string) {
  const now = Date.now();

  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    await db.projects.delete(id);

    await db.pendingSync.add({
      table: "projects",
      entity_id: id,
      operation: "delete",
      payload: { id },
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   GET ALL PROJECTS (LOCAL CACHE)
   ========================================================= */

export async function getProjects() {
  return await db.projects
    .orderBy("updated_at")
    .reverse()
    .toArray();
}
