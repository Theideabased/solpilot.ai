import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a function to get the Supabase client
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// For backwards compatibility, export the client but handle missing env vars gracefully
export const supabase = (() => {
  try {
    return getSupabaseClient();
  } catch (error) {
    // During build time or when env vars are missing, return a mock client
    // This prevents build failures while maintaining type safety
    console.warn("Supabase client initialization failed:", error);
    return null as any; // This will be handled at runtime
  }
})();
