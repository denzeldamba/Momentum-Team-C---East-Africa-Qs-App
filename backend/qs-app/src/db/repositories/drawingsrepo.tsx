import { db, type ProjectFile } from "../OfflineDb";

/* =========================================================
   ADD PROJECT FILE (DRAWING / IMAGE)
   ========================================================= */

export async function addProjectFile(file: ProjectFile) {
  const now = Date.now();

  const projectFile: ProjectFile = {
    ...file,
    updated_at: now,
  };

  await db.transaction("rw", db.projectFiles, db.pendingSync, async () => {
    await db.projectFiles.put(projectFile);

    await db.pendingSync.add({
      table: "project_files",
      entity_id: projectFile.id,
      operation: "insert",
      payload: projectFile,
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   DELETE PROJECT FILE
   ========================================================= */

export async function deleteProjectFile(id: string) {
  const now = Date.now();

  await db.transaction("rw", db.projectFiles, db.pendingSync, async () => {
    await db.projectFiles.delete(id);

    await db.pendingSync.add({
      table: "project_files",
      entity_id: id,
      operation: "delete",
      payload: { id },
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   GET FILES BY PROJECT (LOCAL CACHE)
   ========================================================= */

export async function getProjectFilesByProject(projectId: string) {
  return await db.projectFiles
    .where("project_id")
    .equals(projectId)
    .sortBy("updated_at");
}
