"use client"; // This hook is for client components

import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

// This is the ONLY auth hook you will need for your components.
export const useAuth = () => {
  // 1. Create a stable, memoized instance of the Supabase client for the browser.
  // This ensures the client is created only once per component lifecycle.
  const supabase = useMemo(() => createClient(), []);

  // 2. Use TanStack Query to fetch the session, passing the stable client instance.
  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      // The query function now directly calls getSession()
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error; // Let React Query handle the error
      }
      return data.session;
    },
    // The session is managed by onAuthStateChange, so we don't need to refetch it aggressively.
    staleTime: Infinity,
  });

  const user = session?.user ?? null;
  const isAuthenticated = !!session;

  return {
    supabase, // You can return the client instance for other operations in your component
    session,
    user,
    isLoading,
    isAuthenticated,
    isError,
    error,
  };
};

// This listener hook can remain as it is.
export const useInitializeAuthListener = () => {
  const { initializeListener, isListenerInitialized } = useAuthStore();

  useEffect(() => {
    if (!isListenerInitialized) {
      initializeListener();
    }
  }, [initializeListener, isListenerInitialized]);
};
