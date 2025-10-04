import { supabaseAnonKey, supabaseUrl } from "@/constants";
import { createSupabaseBrowserClient } from "@ai_pair_programmer/supabse-client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supabase = createSupabaseBrowserClient(
  supabaseUrl as string,
  supabaseAnonKey as string
);
