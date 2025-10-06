"use client";

import { authActions } from "@/actions/auth.action";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/utils";
import { AuthActionArgs, AuthMode, Provider } from "@/types/auth.types";
import { AuthError, Session } from "@supabase/supabase-js";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

// Type for the authentication form mutation props
type AuthFormMutationProps = {
  router: ReturnType<typeof useRouter>;
};
type AuthProviderMutationProps = {
  setActiveProvider: Dispatch<SetStateAction<Provider | null>>;
};
type AuthLogoutMutationProps = {
  router: ReturnType<typeof useRouter>;
};

// Custom hook for auth form mutation
export function useAuthFormMutation({ router }: AuthFormMutationProps) {
  return useMutation<
    { email: string; session: Session | null },
    AuthError,
    AuthActionArgs
  >({
    mutationFn: ({ mode, values }) =>
      authActions.authFormAction({ mode, values, supabase }),
    onSuccess: (data) => {
      console.log("session on success:", data.session);
      if (data.session) {
        queryClient.setQueryData(["session"], data.session);
        router.push(`/`);
        return;
      }
      console.log("redirecting to verify page");
      router.push(`/auth/verify?email=${data.email}`);
    },
    onError: (error) => {
      error instanceof AuthError
        ? toast.error(error.message, { duration: 2000 })
        : toast.error("Something went wrong", { duration: 2000 });
    },
  });
}

// Custom hook for auth provider mutation
export function useAuthProviderMutation({
  setActiveProvider,
}: AuthProviderMutationProps) {
  return useMutation<void, AuthError, { provider: Provider }>({
    mutationFn: ({ provider }) => {
      return authActions.authProviderAction({
        provider,
        supabase,
      });
    },
    onError: (error) => {
      error instanceof AuthError
        ? toast.error(error.message, { duration: 2000 })
        : toast.error("Something went wrong", { duration: 2000 });
      setActiveProvider(null);
    },
  });
}

// Custom hook for OTP verification mutation
export function useAuthVerifyOTPMutation({
  router,
}: {
  router: ReturnType<typeof useRouter>;
}) {
  return useMutation<Session, AuthError, { token: string; email: string }>({
    mutationFn: ({ token, email }) =>
      authActions.authVerifyOTPAction({ supabase, token, email }),
    onSuccess: (session: Session) => {
      queryClient.setQueryData(["session"], session);
      router.push("/onboarding");
    },
    onError: (error) => {
      error instanceof Error
        ? toast.error(error.message, { duration: 2000 })
        : toast.error("Something went wrong", { duration: 2000 });
    },
  });
}

// Custom hook for logout mutation
export function useAuthLogoutMutation({ router }: AuthLogoutMutationProps) {
  // Use the shared queryClient instance
  return useMutation<void, AuthError>({
    mutationFn: () => authActions.authLogoutAction({ supabase }),
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully", {
        duration: 1500,
      });
      router.push("/");
    },
    onError: (error) => {
      error instanceof AuthError
        ? toast.error(error.message, { duration: 2000 })
        : toast.error("Something went wrong", { duration: 2000 });
    },
  });
}
