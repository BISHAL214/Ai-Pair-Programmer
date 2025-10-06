import { supabaseAnonKey, supabaseServiceKey, supabaseUrl } from "@/constants";
import { supabase as supabase_client } from "@repo/supabase-client";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supabase = supabase_client;

export const supabase_service = createClient(
  supabaseUrl as string,
  supabaseServiceKey as string,
);
