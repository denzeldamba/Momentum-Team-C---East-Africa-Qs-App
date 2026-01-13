import { db } from "../db/OfflineDb";
import { supabase } from "../lib/Supabase";

let isSyncing = false;

export async function syncPending() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const queue = await db.pendingSync
      .orderBy("created_at")
      .toArray();

    for (const item of queue) {
      const { table, operation, payload, id } = item;

      if (operation === "insert") {
        await supabase.from(table).insert(payload);
      }

      if (operation === "update") {
        await supabase.from(table).update(payload).eq("id", payload.id);
      }

      if (operation === "delete") {
        await supabase.from(table).delete().eq("id", payload.id);
      }

      await db.pendingSync.delete(id!);
    }
  } catch (err) {
    console.error("Sync error:", err);
  } finally {
    isSyncing = false;
  }
}
