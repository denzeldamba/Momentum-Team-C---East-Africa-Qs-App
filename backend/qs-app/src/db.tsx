import Dexie, { type Table } from "dexie";

// ------------------------------
//  OFFLINE SYNC QUEUE
// ------------------------------

export interface PendingSync {
  id?: number;
  table: string;          // e.g. "projects", "boq_items", "measurements"
  operation: "insert" | "update" | "delete";
  payload: any;           // The actual data to sync
  created_at: number;     // timestamp
}

// ------------------------------
//  OFFLINE CACHED TABLES
//  (for QS MVP)
// ------------------------------

export interface Project {
  id: string;
  name: string;
  client: string;
  updated_at: number;
}

export interface BoqItem {
  id: string;
  project_id: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  updated_at: number;
}

export interface Measurement {
  id: string;
  boq_item_id: string;
  length: number;
  width: number;
  height?: number;
  updated_at: number;
}

// ------------------------------
//  Dexie Database
// ------------------------------

export class OfflineDB extends Dexie {
  pendingSync!: Table<PendingSync, number>;
  projects!: Table<Project, string>;
  boqItems!: Table<BoqItem, string>;
  measurements!: Table<Measurement, string>;

  constructor() {
    super("qs_mvp_offline_db");

    this.version(1).stores({
      pendingSync: "++id, table, operation, created_at",
      projects: "id, name, updated_at",
      boqItems: "id, project_id, updated_at",
      measurements: "id, boq_item_id, updated_at",
    });
  }
}

export const db = new OfflineDB();
