// apps/client/src/lib/supabase/client.ts
import { supabaseAnonKey, supabaseServiceKey, supabaseUrl } from "@/constants";
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
export function createServiceCLient() {
  return createSupabaseClient(supabaseUrl!, supabaseServiceKey!);
}
