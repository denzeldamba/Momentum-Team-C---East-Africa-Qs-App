import Dexie, { type Table } from "dexie";

/* =========================================================
   TYPES & INTERFACES
   ========================================================= */

export interface Project {
  id: string;
  user_id: string;
  name: string;
  location: string;
  client_name: string; // CHANGED from 'client' to match SQL
  status: "active" | "completed" | "archived"; // Match SQL check
  created_at: number;
  updated_at: number;
}

export interface Measurement {
  id: string;
  drawing_id: string; // CHANGED: Must link to drawing, not project, per SQL
  measurement_type: "area" | "length" | "count"; // Match SQL
  points: { x: number; y: number }[]; // CHANGED: Flattened to match JSONB
  calculated_value: number;
  unit: string;
  created_by: string;
  updated_at: number;
}

type SyncPayload = 
  | Project 
  | ProjectFile 
  | Measurement 
  | Rate 
  | BoqItem 
  | MeasurementResult 
  | Report 
  | { id: string };

export interface PendingSync {
  id?: number;
  table: string;
  entity_id: string;
  operation: "insert" | "update" | "delete";
  payload: SyncPayload;
  status: "pending" | "synced" | "failed";
  created_at: number;
}

// ... (Other interfaces: ProjectFile, Measurement, Rate, etc. remain the same)
export interface ProjectFile { id: string; project_id: string; name: string; file_url: string; file_type: "pdf" | "image"; scale?: number; version: number; is_latest: boolean; updated_at: number; }
export interface MeasurementPoint { x: number; y: number; }
// export interface Measurement { id: string; project_id: string; file_id: string; type: "area" | "length"; geometry: { points: MeasurementPoint[]; }; scale: number; calculated_value: number; updated_at: number; }
export interface Rate { id: string; category: string; name: string; unit: string; value: number; location: string; updated_at: number; }
export interface BoqItem { id: string; project_id: string; description: string; unit: string; rate_id: string; updated_at: number; }
export interface MeasurementResult { id: string; measurement_id: string; boq_item_id: string; quantity: number; rate: number; total: number; updated_at: number; }
export interface Report { id: string; project_id: string; type: "interim_payment" | "final_account"; total: number; created_at: number; }

/* =========================================================
   DEXIE DATABASE
   ========================================================= */

export class OfflineDB extends Dexie {
  pendingSync!: Table<PendingSync, number>;
  projects!: Table<Project, string>;
  projectFiles!: Table<ProjectFile, string>;
  measurements!: Table<Measurement, string>;
  rates!: Table<Rate, string>;
  boqItems!: Table<BoqItem, string>;
  measurementResults!: Table<MeasurementResult, string>;
  reports!: Table<Report, string>;

  constructor() {
    super("qs_offline_db");

    // Version 3: Adding user_id index to projects for filtered fetching
    this.version(3).stores({
      pendingSync: "++id, table, entity_id, status, created_at",
      projects: "id, user_id, updated_at", // Added user_id here for queries
      projectFiles: "id, project_id, updated_at",
      measurements: "id, project_id, file_id, updated_at",
      rates: "id, category, updated_at",
      boqItems: "id, project_id, updated_at",
      measurementResults: "id, boq_item_id, updated_at",
      reports: "id, project_id, created_at",
    });
  }
}

export const db = new OfflineDB();