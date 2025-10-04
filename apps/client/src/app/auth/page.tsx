"use client";

import { AuthForm } from "@/__components-app/auth-form";
import PixelBlast from "@/__components-app/pixel-blast";
import { useRouter } from "next/navigation";
import { useState } from "react";

const page = () => {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AuthForm mode={authMode} setMode={setAuthMode} showOAuth={true} />
      <div className="w-full h-[100vh] absolute hidden dark:block">
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
      </div>
    </div>
  );
};

export default page;
