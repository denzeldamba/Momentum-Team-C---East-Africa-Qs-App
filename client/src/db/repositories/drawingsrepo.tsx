import { db, type ProjectFile } from "../OfflineDb";

export async function addProjectFile(file: ProjectFile, userId: string) {
  const now = Date.now();

  const projectFile: ProjectFile = {
    ...file,
    updated_at: now,
  };

  await db.transaction("rw", db.projectFiles, db.pendingSync, async () => {
    await db.projectFiles.put(projectFile);

    await db.pendingSync.add({
      table: "drawings", // Matches Scheme.sql
      entity_id: projectFile.id,
      operation: "insert",
      payload: { ...projectFile, user_id: userId }, 
      status: "pending",
      created_at: now,
    });
  });
}

export async function deleteProjectFile(id: string, userId: string) {
  const now = Date.now();

  await db.transaction("rw", db.projectFiles, db.pendingSync, async () => {
    await db.projectFiles.delete(id);

    await db.pendingSync.add({
      table: "drawings",
      entity_id: id,
      operation: "delete",
      payload: { id, user_id: userId }, // Required for RLS
      status: "pending",
      created_at: now,
    });
  });
}

export async function getProjectFilesByProject(projectId: string) {
  return await db.projectFiles
    .where("project_id")
    .equals(projectId)
    .reverse()
    .sortBy("updated_at");
}