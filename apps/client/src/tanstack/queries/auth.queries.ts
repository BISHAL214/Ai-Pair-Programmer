// "use client";

// import { authActions } from "@/actions/auth.action";
// import { SupabaseClient } from "@supabase/supabase-js";
// import { useQuery } from "@tanstack/react-query";

// // Hook for authentication and user session
// export function useUserSessionQuery({
//   supabase,
// }: {
//   supabase: SupabaseClient;
// }) {
//   return useQuery({
//     queryKey: ["session"],
//     queryFn: () => authActions.authFetchUserSession({ supabase }),
//     retry: 1,
//     staleTime: Infinity,
//     gcTime: Infinity,
//   });
// }
