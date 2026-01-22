import { db } from "../OfflineDb";
import type { Project } from "../OfflineDb";

/**
 * Creates a project locally and queues it for cloud synchronization.
 * Storing the user_id locally is critical for offline persistence.
 */
export async function createProject(project: Project, userId: string) {
  const projectWithUser: Project = { 
    ...project, 
    user_id: userId,
    updated_at: Date.now() 
  }; 

  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    // 1. Persist to Dexie (IndexedDB)
    await db.projects.put(projectWithUser); 

    // 2. Queue for Supabase synchronization
    await db.pendingSync.add({
      table: "projects",
      operation: "insert",
      payload: projectWithUser,
      created_at: Date.now(),
    });
  });
}

/**
 * Updates a project locally.
 * We pass userId to ensure we are only updating records owned by the logged-in user.
 */
export async function updateProject(project: Project, userId: string) {
  const updatedProject: Project = {
    ...project,
    user_id: userId, // Re-enforce user_id
    updated_at: Date.now()
  };

  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    // 1. Update local cache
    await db.projects.put(updatedProject);

    // 2. Queue update operation for cloud sync
    await db.pendingSync.add({
      table: "projects",
      operation: "update",
      payload: updatedProject,
      created_at: Date.now(),
    });
  });
}

/**
 * Removes project from local Dexie and queues deletion for Supabase.
 */
export async function deleteProject(id: string, userId: string) {
  try {
    await db.transaction("rw", db.projects, db.pendingSync, async () => {
      // 1. Verify ownership locally before deleting
      const project = await db.projects.get(id);
      if (!project || project.user_id !== userId) return;

      // 2. Remove from local store
      await db.projects.delete(id);

      // 3. Log the sync operation (Payload only needs the ID for deletion)
      await db.pendingSync.add({
        table: "projects",
        operation: "delete",
        payload: { id }, 
        created_at: Date.now(),
      });
    });
  } catch (error) {
    console.error("Failed to delete project in Dexie:", error);
    throw error;
  }
}

/**
 * Retrieves all local projects for the authenticated user.
 * Uses the Dexie index we created in OfflineDb for high performance.
 */
export async function getProjects(userId?: string) {
  if (!userId) return []; 
  
  return await db.projects
    .where("user_id")
    .equals(userId)
    .reverse()
    .sortBy("updated_at");
}

/**
 * Single Project Fetch (Needed for the Project Details / Open flow)
 */
export async function getProjectById(id: string, userId: string) {
  const project = await db.projects.get(id);
  if (!project || project.user_id !== userId) return null;
  return project;
}