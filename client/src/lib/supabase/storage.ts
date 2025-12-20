import { supabase } from "./client";

/**
 * Uploads a file to a given bucket and path.
 * Returns the file path on success.
 */
export async function uploadFile(
	bucket: string,
	path: string,
	file: Blob | File
): Promise<string> {
	const { data, error } = await supabase.storage
		.from(bucket)
		.upload(path, file);

	if (error) throw error;
	return data.path;
}

/**
 * Downloads a file from a given bucket and path.
 * Returns a Blob.
 */
export async function downloadFile(
	bucket: string,
	path: string
): Promise<Blob> {
	const { data, error } = await supabase.storage.from(bucket).download(path);
	if (error || !data) throw error || new Error("File not found");
	return data;
}

/**
 * Gets a public URL for a file in a bucket.
 */
export function getPublicUrl(bucket: string, path: string): string {
	const { data } = supabase.storage.from(bucket).getPublicUrl(path);
	return data.publicUrl;
}

/**
 * Deletes a file from a bucket.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
	const { error } = await supabase.storage.from(bucket).remove([path]);
	if (error) throw error;
}
