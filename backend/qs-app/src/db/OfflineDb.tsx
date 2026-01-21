import Dexie, { type Table } from "dexie";

/* =========================================================
   OFFLINE SYNC QUEUE
   ========================================================= */

export interface PendingSync {
  id?: number; // Auto-increment (Dexie only)
  table: string; // Supabase table name
  entity_id: string; // UUID of the record
  operation: "insert" | "update" | "delete";
  payload: any; // Full record snapshot
  status: "pending" | "synced" | "failed";
  created_at: number;
}

/* =========================================================
   CORE DOMAIN TABLES (OFFLINE CACHE)
   ========================================================= */

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "draft" | "active" | "completed";
  updated_at: number;
}

/* ---------------------------
   PROJECT FILES (DRAWINGS)
   --------------------------- */

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  file_url: string;
  file_type: "pdf" | "image";
  scale?: number; // meters per pixel
  version: number;
  is_latest: boolean;
  updated_at: number;
}

/* ---------------------------
   MEASUREMENTS (GEOMETRY)
   --------------------------- */

export interface MeasurementPoint {
  x: number;
  y: number;
}

export interface Measurement {
  id: string;
  project_id: string;
  file_id: string;
  type: "area" | "length";
  geometry: {
    points: MeasurementPoint[];
  };
  scale: number; // copied from drawing at time of measurement
  calculated_value: number; // m² or m
  updated_at: number;
}

/* ---------------------------
   RATES
   --------------------------- */

export interface Rate {
  id: string;
  category: string; // Concrete, Walling, Finishes
  name: string;
  unit: string; // m², m³, lm
  value: number;
  location: string; // Nairobi
  updated_at: number;
}

/* ---------------------------
   BOQ ITEMS (LOGICAL ITEMS)
   --------------------------- */

export interface BoqItem {
  id: string;
  project_id: string;
  description: string;
  unit: string;
  rate_id: string;
  updated_at: number;
}

/* ---------------------------
   MEASUREMENT RESULTS (SMM OUTPUT)
   --------------------------- */

export interface MeasurementResult {
  id: string;
  measurement_id: string;
  boq_item_id: string;
  quantity: number;
  rate: number;
  total: number;
  updated_at: number;
}

/* ---------------------------
   REPORTS (PDF OUTPUT)
   --------------------------- */

export interface Report {
  id: string;
  project_id: string;
  type: "interim_payment" | "final_account";
  total: number;
  created_at: number;
}

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

    /* -------------------------------------------------------
       VERSION 1 – INITIAL MVP
       ------------------------------------------------------- */

    this.version(1).stores({
      pendingSync: "++id, table, created_at",

      projects: "id, updated_at",
      projectFiles: "id, project_id, updated_at",
      measurements: "id, project_id, file_id, updated_at",
      rates: "id, category, updated_at",
      boqItems: "id, project_id, updated_at",
      measurementResults: "id, boq_item_id, updated_at",
      reports: "id, project_id, created_at",
    });

    /* -------------------------------------------------------
       VERSION 2 – SYNC HARDENING (SAFE UPGRADE)
       ------------------------------------------------------- */

    this.version(2).stores({
      pendingSync: "++id, table, entity_id, status, created_at",

      projects: "id, updated_at",
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
