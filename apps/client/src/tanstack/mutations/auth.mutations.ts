"use client";

import { authActions } from "@/actions/auth.action";
import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/utils";
import { AuthActionArgs, AuthMode, Provider } from "@/types/auth.types";
import { AuthError, Session, SupabaseClient } from "@supabase/supabase-js";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

// Type for the authentication form mutation props
type AuthFormMutationProps = {
  mode: AuthMode;
  router: ReturnType<typeof useRouter>;
};
type AuthProviderMutationProps = {
  setActiveProvider: Dispatch<SetStateAction<Provider | null>>;
};
type AuthLogoutMutationProps = {
  router: ReturnType<typeof useRouter>;
};

export const authMutaions = {
  authFormMutation: ({ router }: AuthFormMutationProps) =>
    useMutation<Session | null, AuthError, AuthActionArgs>({
      mutationFn: ({ mode, values }) =>
        authActions.authFormAction({ mode, values, supabase }),
      // mutationKey: ["auth", mode],
      onSuccess: (session: null | Session) => {
        //   queryClient.invalidateQueries({ queryKey: ["user"] });
        // For a faster UI update, we can set the query data directly
        console.log("session on success:", session);
        if (session) {
          queryClient.setQueryData(["session"], session);
          router.push(`/`);
          return;
        }

        console.log("redirecting to verify page");
        router.push(`/auth/verify`);
        //   toast.success(`${mode === "login" ? "Welcome back!" : "Welcome!"}`, {
        //     duration: 1500,
        //   });
        //   const time = setTimeout(() => {
        //     router.push("/");
        //     clearTimeout(time);
        //   }, 1500);
        //   router.push(`/auth/verify?email=${session.user.email}`);
      },
      onError: (error) => {
        error instanceof AuthError
          ? toast.error(error.message, { duration: 2000 })
          : toast.error("Something went wrong", { duration: 2000 });
      },
    }),
  authProviderMutation: ({ setActiveProvider }: AuthProviderMutationProps) =>
    useMutation<void, AuthError, Provider>({
      mutationFn: async (providerArg: Provider) => {
        return authActions.authProviderAction({
          provider: providerArg,
          supabase,
        });
      },
      onError: (error) => {
        error instanceof AuthError
          ? toast.error(error.message, { duration: 2000 })
          : toast.error("Something went wrong", { duration: 2000 });
        setActiveProvider(null);
      },
    }),

  authVerifyOTPMutation: ({
    router,
  }: {
    router: ReturnType<typeof useRouter>;
  }) =>
    useMutation<Session, AuthError, { token: string; email: string }>({
      mutationFn: ({ token, email }) =>
        authActions.authVerifyOTPAction({ supabase, token, email }),
      onSuccess: (session: Session) => {
        queryClient.setQueryData(["session"], session);
        //   toast.success("Email verified successfully!", { duration: 1500 });
        //   const time = setTimeout(() => {
        //     router.push("/");
        //     clearTimeout(time);
        //   }, 1500);
      },
      onError: (error) => {
        error instanceof Error
          ? toast.error(error.message, { duration: 2000 })
          : toast.error("Something went wrong", { duration: 2000 });
      },
    }),
  authLogoutMutation: ({ router }: AuthLogoutMutationProps) => {
    const queryClient = new QueryClient();
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
  },
};
