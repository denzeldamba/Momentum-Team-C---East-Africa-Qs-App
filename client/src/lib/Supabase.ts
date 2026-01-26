import { createClient } from "@supabase/supabase-js";

// 1. Grab environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string;

/**
 * RECONCILED CLIENT
 * This merges your Auth persistence (for PWA/Offline) with the 
 * standard Supabase initialization.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,    // Required for PWA / Offline Worker
    autoRefreshToken: true, // Keep user logged in when back online
    detectSessionInUrl: true,
    storage: window.localStorage, // The "Vault" for your JWT
  },
});

// Default export for easy importing
export default supabase;