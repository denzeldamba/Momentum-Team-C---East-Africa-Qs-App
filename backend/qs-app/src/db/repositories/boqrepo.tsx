import { db, type BoqItem } from "../OfflineDb";

/* =========================================================
   ADD BOQ ITEM (OFFLINE-FIRST)
   ========================================================= */

export async function addBoqItem(item: BoqItem) {
  const now = Date.now();

  const boqItem: BoqItem = {
    ...item,
    updated_at: now,
  };

  await db.transaction("rw", db.boqItems, db.pendingSync, async () => {
    await db.boqItems.put(boqItem);

    await db.pendingSync.add({
      table: "boq_items",
      entity_id: boqItem.id,
      operation: "insert",
      payload: boqItem,
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   UPDATE BOQ ITEM (OFFLINE-FIRST)
   ========================================================= */

export async function updateBoqItem(item: BoqItem) {
  const now = Date.now();

  const boqItem: BoqItem = {
    ...item,
    updated_at: now,
  };

  await db.transaction("rw", db.boqItems, db.pendingSync, async () => {
    await db.boqItems.put(boqItem);

    await db.pendingSync.add({
      table: "boq_items",
      entity_id: boqItem.id,
      operation: "update",
      payload: boqItem,
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   GET BOQ ITEMS BY PROJECT (LOCAL CACHE)
   ========================================================= */

export async function getBoqByProject(projectId: string) {
  return await db.boqItems
    .where("project_id")
    .equals(projectId)
    .sortBy("updated_at");
}
