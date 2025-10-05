import {
  AuthActionArgs,
  LoginFormValues,
  Provider,
  SignupFormValues,
} from "@/types/auth.types";
import { Session, SupabaseClient } from "@supabase/supabase-js";

export const authActions = {
  authFormAction: async ({
    mode,
    values,
    supabase,
  }: AuthActionArgs): Promise<{ email: string; session: Session | null }> => {
    if (!supabase) {
      throw new Error("Supabase client is not defined.");
    }
    try {
      if (mode === "signup") {
        const { fullName, email, password } = values as SignupFormValues;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, email } },
        });
        if (error) {
          console.log("error signing up:", error);
          throw error;
        }
        return { email, session: null };
      } else {
        const { email, password } = values as LoginFormValues;
        const {
          data: { session },
          error,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error || !session)
          throw error || new Error("No session found. Please try again.");
        return { email, session };
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Authentication error: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred during authentication.");
      }
    }
  },
  authProviderAction: async ({
    provider,
    supabase,
  }: {
    provider: Provider;
    supabase: SupabaseClient;
  }) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        // You can add more advanced error handling here, e.g., logging or custom error messages
        if (error instanceof Error) {
          throw new Error(`OAuth sign-in failed: ${error.message}`);
        } else {
          throw error;
        }
      }
    } catch (err) {
      // Optionally, log the error or handle specific error types
      if (err instanceof Error) {
        // Handle known error
        throw new Error(`Authentication provider error: ${err.message}`);
      } else {
        // Handle unknown error
        throw new Error("An unknown error occurred during OAuth sign-in.");
      }
    }
  },
  authVerifyOTPAction: async ({
    supabase,
    token,
    email,
  }: {
    supabase: SupabaseClient;
    token: string;
    email: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });
      if (error) throw error;
      if (!data.session) throw new Error("No session found. Please try again.");
      return data.session;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OTP verification failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred during OTP verification.");
      }
    }
  },
  authLogoutAction: async ({ supabase }: { supabase: SupabaseClient }) => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Logout failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred during logout.");
      }
    }
  },
  authFetchUserSession: async ({ supabase }: { supabase: SupabaseClient }) => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};
