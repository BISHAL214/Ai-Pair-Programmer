import { useUserSessionQuery } from "@/tanstack/queries/auth.queries";
import { useAuthStore } from "@/zustand/useAuthStore";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect } from "react";

// Hook to access authentication state and user info
export const useAuth = (supabase: SupabaseClient) => {
  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useUserSessionQuery({ supabase });
  const user = session?.user ?? null;

  return {
    session,
    user,
    isLoading,
    isAuthenticated: !!session,
    isError,
    error,
  };
};

// Hook to initialize the auth state listener
export const useInitializeAuthListener = () => {
  const { initializeListener, isListenerInitialized } = useAuthStore();

  useEffect(() => {
    if (!isListenerInitialized) {
      initializeListener();
    }
  }, [initializeListener, isListenerInitialized]);
};
