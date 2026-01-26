import { db, type PendingSync } from "../db/OfflineDb";
import { supabase } from "../lib/Supabase";

let isSyncing = false;

function hasTimestamp(payload: unknown): payload is { updated_at: number } & Record<string, unknown> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "updated_at" in payload &&
    typeof (payload as { updated_at: unknown }).updated_at === "number"
  );
}

export async function syncPending(userId: string) {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    const queue = await db.pendingSync
      .where("status")
      .equals("pending")
      .sortBy("created_at");

    for (const job of queue as PendingSync[]) {
      try {
        const { id, table, entity_id, payload, operation } = job;

        // 1. CONFLICT RESOLUTION (Fetch server version)
        const { data: serverRecord, error: fetchError } = await supabase
          .from(table)
          .select("updated_at")
          .eq("id", entity_id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (hasTimestamp(payload) && serverRecord?.updated_at) {
          const serverUpdatedAt = new Date(serverRecord.updated_at).getTime();
          if (serverUpdatedAt > payload.updated_at) {
            // Server is newer, skip local update
            await db.pendingSync.update(id!, { status: "synced" });
            continue; 
          }
        }

        // 2. APPLY CHANGES
        if (operation === "insert" || operation === "update") {
          const supabasePayload: Record<string, unknown> = 
            typeof payload === "object" && payload !== null ? { ...payload } : {};
          
          // Convert numeric timestamps to ISO strings for Postgres
          if (hasTimestamp(payload)) {
            supabasePayload.updated_at = new Date(payload.updated_at).toISOString();
          }
          if (supabasePayload.created_at && typeof supabasePayload.created_at === 'number') {
            supabasePayload.created_at = new Date(supabasePayload.created_at).toISOString();
          }

          // Ensure user_id is set correctly for RLS
          supabasePayload.user_id = userId;

          const { error } = await supabase
            .from(table)
            .upsert(supabasePayload, { onConflict: "id" });

          if (error) throw error;
        }

        if (operation === "delete") {
          const { error } = await supabase
            .from(table)
            .delete()
            .eq("id", entity_id)
            .eq("user_id", userId); // Security: only delete if owner

          if (error) throw error;
        }

        await db.pendingSync.update(id!, { status: "synced" });
      } catch (jobError) {
        console.error(`Sync failed for ${job.table}:`, jobError);
        // Leave as pending to retry later, or mark as failed
      }
    }
  } finally {
    isSyncing = false;
  }
}