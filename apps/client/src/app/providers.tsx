/**
 * @file This file defines the main Providers component that wraps the entire application.
 * It sets up context providers for theming, authentication, and data fetching,
 * ensuring that these services are available to all child components. It also includes
 * decorative background styles.
 * @requires @/lib/auth
 * @requires @/lib/query-client
 * @requires next-themes
 * @requires react
 */
"use client";

import { AuthProvider } from "@/lib/auth";
import ReactQueryClientProviders from "@/lib/query-client";
import { ThemeProvider } from "next-themes";
import React from "react";

/**
 * A component that wraps the application with essential providers.
 * This includes:
 * - `ThemeProvider` for managing light and dark modes.
 * - `AuthProvider` for handling user authentication state.
 * - `ReactQueryClientProviders` for client-side data fetching and caching with TanStack Query.
 * It also renders aesthetic background effects.
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the providers.
 * @returns {JSX.Element} The application content wrapped with all necessary providers.
 */
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ReactQueryClientProviders>
          <div className="min-h-screen w-full relative">
            {/* Decorative background gradient for the light theme. */}
            <div
              className="absolute inset-0 z-0 dark:hidden"
              style={{
                backgroundImage: `
        linear-gradient(180deg,
          rgba(245,245,220,1) 0%,
          rgba(255,223,186,0.8) 25%,
          rgba(255,182,193,0.6) 50%,
          rgba(147,112,219,0.7) 75%,
          rgba(72,61,139,0.9) 100%
        ),
        radial-gradient(circle at 30% 20%, rgba(255,255,224,0.4) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(72,61,139,0.6) 0%, transparent 70%),
        radial-gradient(circle at 50% 60%, rgba(147,112,219,0.3) 0%, transparent 60%)
      `,
              }}
            />
            {children}
          </div>
        </ReactQueryClientProviders>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default Providers;
