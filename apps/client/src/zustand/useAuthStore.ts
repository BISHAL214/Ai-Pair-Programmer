// --- Zustand Store for the Auth Listener ---
"use client";

import { queryClient } from "@/lib/query-client";
import { createClient } from "@/lib/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { create } from "zustand";

// The store is primarily to ensure the onAuthStateChange listener is set up only once.
interface AuthState {
  isListenerInitialized: boolean;
  initializeListener: () => void;
}
const supabase = createClient();

export const useAuthStore = create<AuthState>((set, get) => ({
  isListenerInitialized: false,
  initializeListener: () => {
    // Prevent setting up the listener more than once
    if (get().isListenerInitialized) {
      return;
    }

    supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // Invalidate the session query whenever the auth state changes
        console.log(`Supabase auth event: ${event}`);
        console.log("New session:", session);
        queryClient.setQueryData(["session"], session as Session);
      },
    );

    set({ isListenerInitialized: true });
  },
}));
