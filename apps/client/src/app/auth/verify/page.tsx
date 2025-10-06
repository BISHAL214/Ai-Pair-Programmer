"use client";

import { OTPForm } from "@/__components-app/otp-form";
import { usePreventBack } from "@/hooks/use-preventBack";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

const PageContent = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  // Prevent back navigation to the previous page (e.g., login or signup)
  usePreventBack();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <OTPForm email={email as string} />
      </div>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PageContent />
  </Suspense>
);

export default Page;
