import Dexie, { type Table } from "dexie";

// ------------------------------
//  OFFLINE SYNC QUEUE
// ------------------------------
export interface PendingSync {
  id?: number;
  table: string;
  operation: "insert" | "update" | "delete";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any; 
  created_at: number;
}

// ------------------------------
//  OFFLINE CACHED TABLES
// ------------------------------

export interface Project {
  id: string;
  user_id: string;      // CRITICAL for "Verify Once" security
  name: string;
  client_name: string;
  location?: string;
  contract_sum?: number;
  status?: string;      // active, completed, archived
  updated_at: number;
}

export interface Drawing {
  id: string;
  project_id: string;
  user_id: string;      // CRITICAL
  file_name: string;
  file_path: string;    // Local path/blob for offline viewing
  file_url?: string;    // Supabase storage URL
  file_size?: number;
  mime_type?: string;
  page_count?: number;
  updated_at: number;
}

export interface Calibration {
  id: string;
  drawing_id: string;
  user_id: string;
  page_number: number;
  scale_factor: number; // meters per pixel
  unit: string;         // m, mm, cm
  updated_at: number;
}

export interface Measurement {
  id: string;
  drawing_id: string;
  user_id: string;
  page_number: number;
  measurement_type: 'area' | 'length' | 'count';
  points: { x: number; y: number }[]; // Array for polylines/areas
  calculated_value: number;
  unit: string;
  label?: string;
  color?: string;
  updated_at: number;
}

// ------------------------------
//  Dexie Database
// ------------------------------



export class OfflineDB extends Dexie {
  pendingSync!: Table<PendingSync, number>;
  projects!: Table<Project, string>;
  drawings!: Table<Drawing, string>; 
  calibrations!: Table<Calibration, string>;
  measurements!: Table<Measurement, string>;

  constructor() {
    super("qs_mvp_offline_db");

    /**
     * DATABASE VERSIONING
     * We include user_id in the index string for every table.
     * This allows us to use .where("user_id").equals(userId)
     */
    this.version(1).stores({
      pendingSync: "++id, table, operation, created_at",
      projects: "id, name, updated_at, user_id",
      drawings: "id, project_id, updated_at, user_id",
      calibrations: "id, drawing_id, user_id",
      measurements: "id, drawing_id, updated_at, user_id",
    });
  }
}

export const db = new OfflineDB();