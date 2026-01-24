import { db, type Measurement } from "../OfflineDb";

/* =========================================================
   ADD MEASUREMENT (OFFLINE-FIRST)
   ========================================================= */

export async function addMeasurement(measurement: Measurement) {
  const now = Date.now();

  const newMeasurement: Measurement = {
    ...measurement,
    updated_at: now,
  };

  await db.transaction("rw", db.measurements, db.pendingSync, async () => {
    await db.measurements.put(newMeasurement);

    await db.pendingSync.add({
      table: "measurements",
      entity_id: newMeasurement.id,
      operation: "insert",
      payload: newMeasurement,
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   UPDATE MEASUREMENT (OFFLINE-FIRST)
   ========================================================= */

export async function updateMeasurement(measurement: Measurement) {
  const now = Date.now();

  const updatedMeasurement: Measurement = {
    ...measurement,
    updated_at: now,
  };

  await db.transaction("rw", db.measurements, db.pendingSync, async () => {
    await db.measurements.put(updatedMeasurement);

    await db.pendingSync.add({
      table: "measurements",
      entity_id: updatedMeasurement.id,
      operation: "update",
      payload: updatedMeasurement,
      status: "pending",
      created_at: now,
    });
  });
}

/* =========================================================
   GET MEASUREMENTS BY PROJECT
   ========================================================= */

export async function getMeasurementsByProject(projectId: string) {
  return await db.measurements
    .where("project_id")
    .equals(projectId)
    .sortBy("updated_at");
}

/* =========================================================
   GET MEASUREMENTS BY DRAWING / FILE
   ========================================================= */

export async function getMeasurementsByFile(fileId: string) {
  return await db.measurements
    .where("file_id")
    .equals(fileId)
    .sortBy("updated_at");
}