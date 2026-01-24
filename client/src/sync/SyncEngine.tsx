import { db } from "../db/OfflineDb";
import { supabase } from "../lib/Supabase";

let isSyncing = false;

export async function syncPending(userId: string) {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    // Get pending jobs sorted by creation time
    const queue = await db.pendingSync
      .where("status")
      .equals("pending")
      .sortBy("created_at");

    for (const job of queue) {
      try {
        const { id, table, entity_id, payload, operation } = job;

        // --------------------------
        // FETCH SERVER VERSION (IF EXISTS)
        // --------------------------
        const { data: serverRecord, error: fetchError } =
          await supabase
            .from(table)
            .select("updated_at")
            .eq("id", entity_id)
            .maybeSingle();

        if (fetchError) throw fetchError;

        // Convert payload.updated_at to milliseconds
        const localUpdatedAt = new Date(payload.updated_at).getTime();
        const serverUpdatedAt = serverRecord?.updated_at
          ? new Date(serverRecord.updated_at).getTime()
          : null;

        // --------------------------
        // LAST-WRITE-WINS LOGIC
        // --------------------------
        if (serverUpdatedAt !== null && serverUpdatedAt > localUpdatedAt) {
          await db.pendingSync.update(id!, { status: "synced" });
          continue; // Server is newer → skip local change
        }

        // --------------------------
        // APPLY LOCAL CHANGE
        // --------------------------
        if (operation === "insert" || operation === "update") {
          const { error } = await supabase
            .from(table)
            .upsert(
              {
                ...payload,
                updated_at: new Date(payload.updated_at).toISOString(), // ✅ Convert to ISO string
                created_by: userId,
              },
              { onConflict: "id" }
            );

          if (error) throw error;
        }

        if (operation === "delete") {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq("id", entity_id);

          if (error) throw error;
        }

        // Mark job as synced
        await db.pendingSync.update(id!, { status: "synced" });
      } catch (jobError) {
        console.error("Conflict sync failed:", jobError);

        // Mark job as failed for retry
        await db.pendingSync.update(job.id!, { status: "failed" });
      }
    }
  } finally {
    isSyncing = false;
  }
}