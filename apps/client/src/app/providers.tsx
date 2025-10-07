"use client";

import { useInitializeAuthListener } from "@/hooks/use-auth";
import ReactQueryClientProviders from "@/lib/query-client";
import { ThemeProvider } from "next-themes";
import React from "react";
import { Toaster } from "react-hot-toast";

const Providers = ({ children }: { children: React.ReactNode }) => {
  useInitializeAuthListener();
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster position="bottom-left" reverseOrder={false} />
      <ReactQueryClientProviders>
        <div className="min-h-screen w-full relative">
          <div
            className="absolute inset-0 z-0 dark:hidden"
            style={{
              backgroundImage:
                "linear-gradient(to top, #3f51b1 0%, #5a55ae 13%, #7b5fac 25%, #8f6aae 38%, #a86aa4 50%, #cc6b8e 62%, #f18271 75%, #f3a469 87%, #f7c978 100%)",
            }}
          />
          {children}
        </div>
      </ReactQueryClientProviders>
    </ThemeProvider>
  );
};

export default Providers;

{
  /* Sequential Color Light-up Animation */
}
{
  /* <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: "transparent",
              animation: "sequentialLightUp 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
            }}
          />
          <style jsx>{`
            @keyframes sequentialLightUp {
              0% {
                background: radial-gradient(
                  ellipse 120% 80% at 20% 30%,
                  transparent 0%,
                  transparent 100%
                );
              }
              20% {
                background: radial-gradient(
                  ellipse 120% 80% at 20% 30%,
                  rgba(239, 68, 68, 0.8) 0%,
                  rgba(239, 68, 68, 0.3) 30%,
                  transparent 60%
                );
              }
              40% {
                background:
                  radial-gradient(
                    ellipse 120% 80% at 20% 30%,
                    rgba(239, 68, 68, 0.6) 0%,
                    rgba(239, 68, 68, 0.2) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 50% 20%,
                    rgba(59, 130, 246, 0.8) 0%,
                    rgba(59, 130, 246, 0.3) 30%,
                    transparent 60%
                  );
              }
              60% {
                background:
                  radial-gradient(
                    ellipse 120% 80% at 20% 30%,
                    rgba(239, 68, 68, 0.4) 0%,
                    rgba(239, 68, 68, 0.1) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 50% 20%,
                    rgba(59, 130, 246, 0.6) 0%,
                    rgba(59, 130, 246, 0.2) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 80% 30%,
                    rgba(34, 197, 94, 0.8) 0%,
                    rgba(34, 197, 94, 0.3) 30%,
                    transparent 60%
                  );
              }
              80% {
                background:
                  radial-gradient(
                    ellipse 120% 80% at 20% 30%,
                    rgba(239, 68, 68, 0.3) 0%,
                    rgba(239, 68, 68, 0.1) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 50% 20%,
                    rgba(59, 130, 246, 0.4) 0%,
                    rgba(59, 130, 246, 0.1) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 80% 30%,
                    rgba(34, 197, 94, 0.6) 0%,
                    rgba(34, 197, 94, 0.2) 25%,
                    transparent 50%
                  ),
                  linear-gradient(
                    135deg,
                    rgba(255, 255, 255, 0.9) 0%,
                    rgba(248, 250, 252, 0.7) 100%
                  );
              }
              100% {
                background:
                  linear-gradient(
                    135deg,
                    rgba(239, 68, 68, 0.15) 0%,
                    rgba(59, 130, 246, 0.2) 30%,
                    rgba(34, 197, 94, 0.15) 60%,
                    rgba(255, 255, 255, 0.95) 80%,
                    rgba(248, 250, 252, 0.9) 100%
                  ),
                  radial-gradient(
                    ellipse at top,
                    rgba(59, 130, 246, 0.1) 0%,
                    transparent 70%
                  );
              }
            }

            .dark @keyframes sequentialLightUp {
              0% {
                background: radial-gradient(
                  ellipse 120% 80% at 20% 30%,
                  transparent 0%,
                  transparent 100%
                );
              }
              20% {
                background: radial-gradient(
                  ellipse 120% 80% at 20% 30%,
                  rgba(239, 68, 68, 0.6) 0%,
                  rgba(239, 68, 68, 0.2) 30%,
                  transparent 60%
                );
              }
              40% {
                background:
                  radial-gradient(
                    ellipse 120% 80% at 20% 30%,
                    rgba(239, 68, 68, 0.4) 0%,
                    rgba(239, 68, 68, 0.1) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 50% 20%,
                    rgba(59, 130, 246, 0.6) 0%,
                    rgba(59, 130, 246, 0.2) 30%,
                    transparent 60%
                  );
              }
              60% {
                background:
                  radial-gradient(
                    ellipse 120% 80% at 20% 30%,
                    rgba(239, 68, 68, 0.3) 0%,
                    rgba(239, 68, 68, 0.08) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 50% 20%,
                    rgba(59, 130, 246, 0.4) 0%,
                    rgba(59, 130, 246, 0.1) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 80% 30%,
                    rgba(34, 197, 94, 0.6) 0%,
                    rgba(34, 197, 94, 0.2) 30%,
                    transparent 60%
                  );
              }
              80% {
                background:
                  radial-gradient(
                    ellipse 120% 80% at 20% 30%,
                    rgba(239, 68, 68, 0.2) 0%,
                    rgba(239, 68, 68, 0.05) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 50% 20%,
                    rgba(59, 130, 246, 0.3) 0%,
                    rgba(59, 130, 246, 0.08) 25%,
                    transparent 50%
                  ),
                  radial-gradient(
                    ellipse 120% 80% at 80% 30%,
                    rgba(34, 197, 94, 0.4) 0%,
                    rgba(34, 197, 94, 0.1) 25%,
                    transparent 50%
                  ),
                  linear-gradient(
                    135deg,
                    rgba(17, 24, 39, 0.95) 0%,
                    rgba(31, 41, 55, 0.9) 100%
                  );
              }
              100% {
                background:
                  linear-gradient(
                    135deg,
                    rgba(239, 68, 68, 0.08) 0%,
                    rgba(59, 130, 246, 0.12) 30%,
                    rgba(34, 197, 94, 0.08) 60%,
                    rgba(17, 24, 39, 0.98) 80%,
                    rgba(31, 41, 55, 0.95) 100%
                  ),
                  radial-gradient(
                    ellipse at top,
                    rgba(59, 130, 246, 0.05) 0%,
                    transparent 70%
                  );
              }
            }
          `}</style> */
}
{
  /* // backgroundImage: ` // linear-gradient(180deg, //
          rgba(245,245,220,1) 0%, // rgba(255,223,186,0.8) 25%, //
          rgba(255,182,193,0.6) 50%, // rgba(147,112,219,0.7) 75%, //
          rgba(72,61,139,0.9) 100% // ), // radial-gradient(circle at 30% 20%,
          rgba(255,255,224,0.4) 0%, transparent 50%), // radial-gradient(circle
          at 70% 80%, rgba(72,61,139,0.6) 0%, transparent 70%), //
          radial-gradient(circle at 50% 60%, rgba(147,112,219,0.3) 0%,
          transparent 60%) // `, */
}
