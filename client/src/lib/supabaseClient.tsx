import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client instance
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
);

export default supabase;