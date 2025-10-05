"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabaseAnonKey, supabaseUrl } from "@/constants";
import { loginSchema, signupSchema } from "@/schemas/auth.schema";
import { authMutaions } from "@/tanstack/mutations/auth.mutations";
import { AuthMode, CurrentFormValues, Provider } from "@/types/auth.types";
import { createSupabaseBrowserClient } from "@ai_pair_programmer/supabse-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type AuthFormProps = {
  mode: AuthMode;
  showOAuth?: boolean;
  setMode: Dispatch<SetStateAction<"login" | "signup">>;
};

export const AuthForm = ({
  mode,
  showOAuth = true,
  setMode,
}: AuthFormProps) => {
  const [supabase] = useState(() =>
    createSupabaseBrowserClient(
      supabaseUrl as string,
      supabaseAnonKey as string,
    ),
  );
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);

  const router = useRouter();

  const currentSchema = mode === "login" ? loginSchema : signupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    defaultValues:
      mode === "login"
        ? { email: "", password: "", rememberMe: false }
        : { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const {
    mutate: handleAuthAction,
    isPending: isAuthActionLoading,
    error: authActionError,
  } = authMutaions.authFormMutation({ router, mode });

  const {
    mutate: signInWithProvider,
    isPending: isProviderLoading,
    error: providerError,
  } = authMutaions.authProviderMutation({
    setActiveProvider,
  });

  // ✨ --- FIX: Wrapper function to handle synchronous and async state --- ✨
  const handleProviderSignIn = (provider: Provider) => {
    // 1. Set local state to show loader immediately
    setActiveProvider(provider);
    // 2. Call mutation to handle the actual API call
    signInWithProvider(provider);
  };

  const isFormLoading = isAuthActionLoading || isProviderLoading;
  const serverError = authActionError || providerError;
  const onFormSubmit = (values: CurrentFormValues) => {
    handleAuthAction({ mode, values });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      className="w-full max-w-md flex flex-col items-center z-10 bg-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-sm"
    >
      <div className="text-center">
        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          {mode === "signup" ? "Create an Account" : "Log in to your Account"}
        </h2>
      </div>

      {showOAuth && (
        <>
          <Button
            className="mt-8 w-full gap-3 cursor-pointer"
            onClick={() => handleProviderSignIn("google")}
            disabled={isFormLoading}
          >
            {/* ✨ --- FIX: Check local state for loader visibility --- ✨ */}
            {activeProvider === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <IconBrandGoogle /> Continue with Google
              </>
            )}
          </Button>

          <Button
            className="mt-2 w-full gap-3 border border-white/20 bg-white/10 dark:bg-black/10 cursor-pointer text-black dark:text-white shadow-xl hover:bg-white/20 dark:hover:bg-black/20"
            onClick={() => handleProviderSignIn("github")}
            disabled={isFormLoading}
          >
            {/* ✨ --- FIX: Check local state for loader visibility --- ✨ */}
            {activeProvider === "github" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <IconBrandGithub className="w-4 h-4" /> Continue with Github
              </>
            )}
          </Button>

          <div className="my-7 w-full flex items-center justify-center overflow-hidden">
            <div className="w-full border-t"></div>
            <span className="text-sm px-2 text-muted-foreground">OR</span>
            <div className="w-full border-t"></div>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="w-full space-y-4">
        {/* ... The rest of your form remains exactly the same ... */}
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Your Name"
              {...register("fullName")}
              disabled={isFormLoading}
            />
            {"fullName" in errors && (
              <p className="text-sm text-red-500 mt-1">
                {(errors as Record<string, any>).fullName.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            {...register("email")}
            disabled={isFormLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            {...register("password")}
            disabled={isFormLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              disabled={isFormLoading}
            />
            {"confirmPassword" in errors && (
              <p className="text-sm text-red-500 mt-1">
                {(errors as Record<string, any>).confirmPassword.message}
              </p>
            )}
          </div>
        )}

        {mode === "login" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                {...register("rememberMe" as keyof CurrentFormValues)}
                disabled={isFormLoading || isProviderLoading}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed"
              >
                Remember me
              </label>
            </div>
            <a
              href="#"
              className="text-sm block underline text-muted-foreground text-center"
            >
              Forgot your password?
            </a>
          </div>
        )}

        {serverError && (
          <p className="text-sm text-red-500">
            {(serverError as Error).message}
          </p>
        )}

        <Button type="submit" disabled={isFormLoading} className="w-full mt-4">
          {isAuthActionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Continue with Email"
          )}
        </Button>
      </form>

      <div className="mt-5 text-sm text-center">
        {mode === "login" ? (
          <p>
            Don&apos;t have an account?
            <span
              onClick={() => !isFormLoading && setMode("signup")}
              className="ml-1 underline text-muted-foreground cursor-pointer"
            >
              Create account
            </span>
          </p>
        ) : (
          <p>
            Already have an account?
            <span
              onClick={() => !isFormLoading && setMode("login")}
              className="ml-1 underline text-muted-foreground cursor-pointer"
            >
              Log In
            </span>
          </p>
        )}
      </div>
    </motion.div>
  );
};
