import Dexie, { type Table } from 'dexie';

// 1. Define the shape of our data
export interface Project {
  id?: number;
  name: string;
  location: string;
  client: string;
  createdAt: number;
}

export interface Measurement {
  id?: number;
  projectId: number;
  description: string;
  unit: 'm' | 'm2' | 'm3' | 'kg' | 'nr';
  quantity: number;
  isSynced: number; // 0 for local-only, 1 for synced to server
  timestamp: number;
}

// 2. Initialize the Database
export class QSDatabase extends Dexie {
  projects!: Table<Project>;
  measurements!: Table<Measurement>;

  constructor() {
    super('QSPocketKnifeDB');
    
    // Define tables and indexes
    // Note: only index fields you plan to search or filter by
    this.version(1).stores({
      projects: '++id, name',
      measurements: '++id, projectId, isSynced'
    });
  }
}

export const db = new QSDatabase();