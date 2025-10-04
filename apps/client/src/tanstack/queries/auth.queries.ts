import { authActions } from "@/actions/auth.action";
import { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

// Queries related to authentication and user session
export const authQueries = {
  userSessionQuery: ({ supabase }: { supabase: SupabaseClient }) =>
    useQuery({
      queryKey: ["session"],
      queryFn: () => authActions.authFetchUserSession({ supabase }),
      retry: 1,
      // We don't want to refetch the session on every window focus,
      // because the auth listener below will handle invalidation.
      staleTime: Infinity,
      gcTime: Infinity,
    }),
};
