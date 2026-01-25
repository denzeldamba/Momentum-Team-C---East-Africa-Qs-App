import { supabase } from "../lib/Supabase";
import { db } from "./OfflineDb";
import type { Project } from "./OfflineDb";

export async function hydrateLocalVault(userId: string) {
  try {
    // 1. Fetch all projects for this user from Supabase
    const { data: serverProjects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    if (!serverProjects || serverProjects.length === 0) return;

    // 2. Map Supabase records (ISO strings) back to Dexie format (numbers)
    const formattedProjects: Project[] = serverProjects.map((p) => ({
      ...p,
      // Ensure local Dexie uses numeric timestamps for sorting
      updated_at: new Date(p.updated_at).getTime(),
    }));

    // 3. Bulk Update Dexie (Last-Write-Wins)
    // We use .put() so it updates existing IDs or adds new ones
    await db.transaction("rw", db.projects, async () => {
      for (const project of formattedProjects) {
        const local = await db.projects.get(project.id);
        
        // Only overwrite if server is newer or local doesn't exist
        if (!local || project.updated_at > local.updated_at) {
          await db.projects.put(project);
        }
      }
    });

    console.log(`Hydrated ${serverProjects.length} projects from cloud.`);
  } catch (err) {
    console.error("Hydration failed:", err);
  }
}