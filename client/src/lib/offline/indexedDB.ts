export class IndexedDBManager {
	private dbName = "OfflineAppDB";
	private version = 1;
	private db: IDBDatabase | null = null;

	async initialize(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Projects store
				if (!db.objectStoreNames.contains("projects")) {
					const store = db.createObjectStore("projects", {
						keyPath: "id",
					});
					store.createIndex("user_id", "user_id", { unique: false });
					store.createIndex("updated_at", "updated_at", {
						unique: false,
					});
				}

				// Drawings store
				if (!db.objectStoreNames.contains("drawings")) {
					const store = db.createObjectStore("drawings", {
						keyPath: "id",
					});
					store.createIndex("project_id", "project_id", {
						unique: false,
					});
					store.createIndex("updated_at", "updated_at", {
						unique: false,
					});
				}

				// Sync queue store
				if (!db.objectStoreNames.contains("syncQueue")) {
					const store = db.createObjectStore("syncQueue", {
						keyPath: "id",
					});
					store.createIndex("synced", "synced", { unique: false });
					store.createIndex("timestamp", "created_at", {
						unique: false,
					});
				}
			};
		});
	}

	private getStore(
		storeName: string,
		mode: IDBTransactionMode
	): IDBObjectStore {
		if (!this.db) throw new Error("IndexedDB not initialized");
		return this.db.transaction(storeName, mode).objectStore(storeName);
	}

	async get<T>(storeName: string, key: string): Promise<T | null> {
		return new Promise((resolve, reject) => {
			const request = this.getStore(storeName, "readonly").get(key);
			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	async getAll<T>(
		storeName: string,
		indexName?: string,
		query?: IDBValidKey
	): Promise<T[]> {
		return new Promise((resolve, reject) => {
			const store = this.getStore(storeName, "readonly");
			const request =
				indexName && query
					? store.index(indexName).getAll(query)
					: store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async put(storeName: string, data: any): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = this.getStore(storeName, "readwrite").put(data);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async delete(storeName: string, key: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = this.getStore(storeName, "readwrite").delete(key);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
}
