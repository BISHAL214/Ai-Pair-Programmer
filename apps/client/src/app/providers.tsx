"use client";

import { AuthProvider } from "@/lib/auth";
import ReactQueryClientProviders from "@/lib/query-client";
import {
  SpacemanThemeProvider,
  ThemeAnimationType,
} from "@space-man/react-theme-animation";
import React from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    //  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AuthProvider>
      <ReactQueryClientProviders>
        <SpacemanThemeProvider
          defaultTheme="system"
          defaultColorTheme="blue"
          themes={["light", "dark", "system"]}
          colorThemes={["default", "blue", "green", "purple"]}
          animationType={ThemeAnimationType.BLUR_CIRCLE}
          duration={800}
        >
          <div className="min-h-screen w-full relative">
            {/* Aurora Dream Diagonal Flow */}

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

            {/* <div
              className="absolute inset-0 z-0 dark:hidden"
              style={{
                background: `
          radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
         radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
         radial-gradient(ellipse 62% 52% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
         radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 190, 255, 0.36), transparent 66%),
         linear-gradient(45deg, #f7eaff 0%, #fde2ea 100%)
        `,
              }}
            /> */}

            {/* <div
              className="absolute inset-0 dark:hidden"
              style={{
                backgroundImage: `
        linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
        linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)
      `,
                backgroundSize: "40px 40px",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
                maskImage:
                  "radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
              }}
            /> */}

            {/* <div
              className="absolute inset-0 z-0 hidden dark:block"
              style={{
                background:
                  "radial-gradient(ellipse 50% 100% at 10% 0%, rgba(226, 232, 240, 0.15), transparent 65%), #000000",
              }}
            /> */}

            {/* Your content goes here */}
            {/* <BackgroundBeams className="hidden dark:block" /> */}
            {/* <div className="w-full h-[1500px] absolute hidden dark:block">
              <PixelBlast
                variant="circle"
                pixelSize={6}
                color="#B19EEF"
                patternScale={3}
                patternDensity={1.2}
                pixelSizeJitter={0.5}
                enableRipples
                rippleSpeed={0.4}
                rippleThickness={0.12}
                rippleIntensityScale={1.5}
                liquid
                liquidStrength={0.12}
                liquidRadius={1.2}
                liquidWobbleSpeed={5}
                speed={0.6}
                edgeFade={0.25}
                transparent
              />
            </div> */}
            {children}
          </div>
        </SpacemanThemeProvider>
      </ReactQueryClientProviders>
    </AuthProvider>
  );
};

export default Providers;
