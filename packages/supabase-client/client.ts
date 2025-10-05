import { createBrowserClient } from "@supabase/ssr";

export const createSupabaseBrowserClient = (
  supabase_url: string,
  supabase_anon_key: string,
) => createBrowserClient(supabase_url, supabase_anon_key);
