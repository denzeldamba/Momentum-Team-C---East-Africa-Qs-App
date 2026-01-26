import { db, type MeasurementResult } from "../OfflineDb";

/* =========================================================
   ADD MEASUREMENT RESULT (OFFLINE-FIRST)
   ========================================================= */

export async function addMeasurementResult(result: MeasurementResult) {
  const now = Date.now();

  const measurementResult: MeasurementResult = {
    ...result,
    updated_at: now,
  };

  await db.transaction(
    "rw",
    db.measurementResults,
    db.pendingSync,
    async () => {
      await db.measurementResults.put(measurementResult);

      await db.pendingSync.add({
        table: "measurement_results",
        entity_id: measurementResult.id,
        operation: "insert",
        payload: measurementResult,
        status: "pending",
        created_at: now,
      });
    }
  );
}

/* =========================================================
   UPDATE MEASUREMENT RESULT
   ========================================================= */

export async function updateMeasurementResult(result: MeasurementResult) {
  const now = Date.now();

  const measurementResult: MeasurementResult = {
    ...result,
    updated_at: now,
  };

  await db.transaction(
    "rw",
    db.measurementResults,
    db.pendingSync,
    async () => {
      await db.measurementResults.put(measurementResult);

      await db.pendingSync.add({
        table: "measurement_results",
        entity_id: measurementResult.id,
        operation: "update",
        payload: measurementResult,
        status: "pending",
        created_at: now,
      });
    }
  );
}

/* =========================================================
   DELETE MEASUREMENT RESULT
   ========================================================= */

export async function deleteMeasurementResult(id: string) {
  const now = Date.now();

  await db.transaction(
    "rw",
    db.measurementResults,
    db.pendingSync,
    async () => {
      await db.measurementResults.delete(id);

      await db.pendingSync.add({
        table: "measurement_results",
        entity_id: id,
        operation: "delete",
        payload: { id },
        status: "pending",
        created_at: now,
      });
    }
  );
}

/* =========================================================
   QUERY HELPERS
   ========================================================= */

/** Get all results generated from a specific measurement */
export async function getResultsByMeasurement(measurementId: string) {
  return await db.measurementResults
    .where("measurement_id")
    .equals(measurementId)
    .sortBy("updated_at");
}

/** Get all results for a BOQ item (used for totals) */
export async function getResultsByBoqItem(boqItemId: string) {
  return await db.measurementResults
    .where("boq_item_id")
    .equals(boqItemId)
    .sortBy("updated_at");
}

/** Calculate BOQ total locally (offline-safe) */
export async function calculateBoqItemTotal(boqItemId: string) {
  const results = await getResultsByBoqItem(boqItemId);

  return results.reduce((sum, r) => sum + r.total, 0);
}
