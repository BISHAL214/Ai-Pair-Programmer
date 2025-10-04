import { loginSchema, signupSchema } from "@/schemas/auth.schema";
import { createSupabaseBrowserClient } from "@ai_pair_programmer/supabse-client";
import z from "zod";

// Define types for our mutation functions
export type Provider = "google" | "github";
export type AuthMode = "login" | "signup";
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type CurrentFormValues = LoginFormValues | SignupFormValues;
export type AuthActionArgs = {
  mode: AuthMode;
  values: CurrentFormValues;
  supabase?: ReturnType<typeof createSupabaseBrowserClient>;
};
