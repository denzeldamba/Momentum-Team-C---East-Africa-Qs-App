import { db, } from '../lib/db';
import type { Measurement } from '../lib/db';


/**
 * Saves a measurement to the local IndexedDB.
 * This is the core of our "Offline-First" architecture.
 */
export const saveMeasurement = async (
    projectId: number, 
    desc: string, 
    qty: number, 
    unit: Measurement['unit']
) => {
  try {
    const id = await db.measurements.add({
      projectId,
      description: desc,
      unit,
      quantity: qty,
      isSynced: 0, // 0 = Draft/Local, 1 = Synced to Cloud
      timestamp: Date.now()
    });
    return id; // Returns the local ID assigned by Dexie
  } catch (error) {
    console.error("Failed to save measurement locally:", error);
    throw error;
  }
};

/**
 * Gets all unsynced measurements to show the user what's waiting for signal.
 */
export const getUnsyncedMeasurements = () => {
  return db.measurements.where('isSynced').equals(0).toArray();
};