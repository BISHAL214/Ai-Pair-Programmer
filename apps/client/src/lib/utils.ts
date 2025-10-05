import { supabaseAnonKey, supabaseServiceKey, supabaseUrl } from "@/constants";
import { createSupabaseBrowserClient } from "@ai_pair_programmer/supabse-client";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supabase = createSupabaseBrowserClient(
  supabaseUrl as string,
  supabaseAnonKey as string,
);

export const supabase_service = createClient(
  supabaseUrl as string,
  supabaseServiceKey as string,
);
