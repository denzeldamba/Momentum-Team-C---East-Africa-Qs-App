import { supabase } from "./client";

/**
 * Inserts a record into a table.
 */
export async function insertRecord<T>(table: string, data: T): Promise<T> {
	const { data: result, error } = await supabase
		.from<T>(table)
		.insert(data)
		.select()
		.single();
	if (error) throw error;
	return result;
}

/**
 * Updates a record by ID.
 */
export async function updateRecord<T>(
	table: string,
	id: string,
	data: Partial<T>
): Promise<T> {
	const { data: result, error } = await supabase
		.from<T>(table)
		.update(data)
		.eq("id", id)
		.select()
		.single();
	if (error) throw error;
	return result;
}

/**
 * Soft deletes a record by ID (sets deleted_at timestamp).
 */
export async function deleteRecord(table: string, id: string): Promise<void> {
	const { error } = await supabase
		.from(table)
		.update({ deleted_at: new Date().toISOString() })
		.eq("id", id);
	if (error) throw error;
}

/**
 * Fetches all records from a table optionally filtered by query.
 */
export async function fetchRecords<T>(
	table: string,
	filters?: Record<string, any>,
	excludeDeleted = true
): Promise<T[]> {
	let query = supabase.from<T>(table).select("*");

	if (filters) {
		for (const [key, value] of Object.entries(filters)) {
			query = query.eq(key, value);
		}
	}

	if (excludeDeleted) {
		query = query.is("deleted_at", null);
	}

	const { data, error } = await query;
	if (error) throw error;
	return data || [];
}

/**
 * Fetches a single record by ID.
 */
export async function fetchRecordById<T>(
	table: string,
	id: string
): Promise<T | null> {
	const { data, error } = await supabase
		.from<T>(table)
		.select("*")
		.eq("id", id)
		.single();
	if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
	return data || null;
}
