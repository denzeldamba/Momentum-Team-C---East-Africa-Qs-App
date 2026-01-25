import { db, type BoqItem } from "../OfflineDb";

export async function addBoqItem(item: BoqItem, userId: string) {
  const now = Date.now();

  const boqItem: BoqItem = {
    ...item,
    updated_at: now,
  };

  await db.transaction("rw", db.boqItems, db.pendingSync, async () => {
    await db.boqItems.put(boqItem);

    await db.pendingSync.add({
      table: "bill_items", // ✅ Matches Scheme.sql
      entity_id: boqItem.id,
      operation: "insert",
      payload: { ...boqItem, user_id: userId }, // Pass userId for Supabase RLS
      status: "pending",
      created_at: now,
    });
  });
}


export async function updateBoqItem(item: BoqItem, userId: string) {
  const now = Date.now();

  const boqItem: BoqItem = {
    ...item,
    updated_at: now,
  };

  await db.transaction("rw", db.boqItems, db.pendingSync, async () => {
    await db.boqItems.put(boqItem);

    await db.pendingSync.add({
      table: "bill_items", // ✅ Matches Scheme.sql
      entity_id: boqItem.id,
      operation: "update",
      payload: { ...boqItem, user_id: userId },
      status: "pending",
      created_at: now,
    });
  });
}

export async function deleteBoqItem(id: string, userId: string) {
  await db.transaction("rw", db.boqItems, db.pendingSync, async () => {
    await db.boqItems.delete(id);

    await db.pendingSync.add({
      table: "bill_items",
      entity_id: id,
      operation: "delete",
      payload: { id, user_id: userId },
      status: "pending",
      created_at: Date.now(),
    });
  });
}

export async function getBoqByProject(projectId: string) {
  return await db.boqItems
    .where("project_id")
    .equals(projectId)
    .reverse() // Newest entries first
    .sortBy("updated_at");
}