import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Crucial for offline use
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // Ensures the JWT is kept in the browser
  },
});