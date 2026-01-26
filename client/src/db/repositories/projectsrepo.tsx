import { db } from "../OfflineDb";
import type { Project } from "../OfflineDb";

export async function createProject(project: Project, userId: string) {
  const now = Date.now();
  
  // Ensure the object strictly matches the Project interface
  const projectWithUser: Project = { 
    ...project, 
    user_id: userId,
    updated_at: now,
    created_at: project.created_at || now // Ensure we don't lose the original timestamp
  }; 

  await db.transaction("rw", db.projects, db.pendingSync, async () => {
    await db.projects.put(projectWithUser); 

    await db.pendingSync.add({
      table: "projects",
      entity_id: projectWithUser.id,
      operation: "insert",
      payload: projectWithUser, // Full object for Upsert
      status: "pending",
      created_at: now,
    });
  });
}

export async function updateProject(project: Project, userId: string) {
  const now = Date.now();
  const updatedProject: Project = {
    ...project,
    user_id: userId,
    updated_at: now
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

export async function deleteProject(id: string, userId: string) {
  try {
    await db.transaction("rw", db.projects, db.pendingSync, async () => {
      const project = await db.projects.get(id);
      if (!project || project.user_id !== userId) return;

      await db.projects.delete(id);

      await db.pendingSync.add({
        table: "projects",
        entity_id: id,
        operation: "delete",
        // ✅ Added user_id here. Supabase RLS needs this to verify 
        // that the person deleting the record owns it.
        payload: { id, user_id: userId }, 
        status: "pending",
        created_at: Date.now(),
      });
    });
  } catch (error) {
    console.error("Failed to delete project in Dexie:", error);
    throw error;
  }
}

export async function getProjects(userId?: string) {
  if (!userId) return []; 
  // This uses the index we created in OfflineDB version 3
  return await db.projects
    .where("user_id")
    .equals(userId)
    .reverse()
    .sortBy("updated_at");
}

export async function getProjectById(id: string, userId: string) {
  const project = await db.projects.get(id);
  if (!project || project.user_id !== userId) return null;
  return project;
}