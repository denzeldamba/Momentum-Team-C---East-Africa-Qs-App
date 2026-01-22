import { db } from "../db/OfflineDb";
import { supabase } from "../lib/Supabase"; // Verify this path matches your Supabase file

let isSyncing = false;

export async function syncPending() {
  // Prevent double-syncing or syncing while offline
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    // Get all pending actions ordered by time
    const queue = await db.pendingSync
      .orderBy("created_at")
      .toArray();

    for (const item of queue) {
      const { table, operation, payload, id } = item;
      let error = null;

      try {
        if (operation === "insert") {
          const { error: err } = await supabase.from(table).insert(payload);
          error = err;
        }

        if (operation === "update") {
          const { error: err } = await supabase.from(table)
            .update(payload)
            .eq("id", payload.id);
          error = err;
        }

        if (operation === "delete") {
          // This matches the payload { id } sent by your projectsrepo
          const { error: err } = await supabase.from(table)
            .delete()
            .eq("id", payload.id);
          error = err;
        }

        // Only remove from local "Pending" list if Supabase confirms success
        if (!error) {
          await db.pendingSync.delete(id!);
        } else {
          console.error(`Sync failed for ${operation}:`, error.message);
          break; // Stop loop to keep operations in correct chronological order
        }
      } catch (e) {
        console.error("Connection error during sync:", e);
        break; 
      }
    }
  } catch (err) {
    console.error("Critical SyncEngine error:", err);
  } finally {
    isSyncing = false;
  }
}

// Automatically attempt sync when the app starts or comes back online
if (typeof window !== "undefined") {
  window.addEventListener('online', syncPending);
  // Optional: Run every 30 seconds as a heartbeat
  setInterval(syncPending, 30000);
}