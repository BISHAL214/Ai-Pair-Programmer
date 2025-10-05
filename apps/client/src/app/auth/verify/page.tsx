"use client";

import { OTPForm } from "@/__components-app/otp-form";
import { usePreventBack } from "@/hooks/use-preventBack";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  // Prevent back navigation to the previous page (e.g., login or signup)
  usePreventBack();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <OTPForm email={email as string} />
        {/* <h3 className="text-lg font-semibold">
          We've sent you a verification email!
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Please check your inbox and click the link to verify your email
          address.
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          If you don't see the email, please check your spam or junk folder.
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Thank you for joining us!
        </p> */}
      </div>
    </div>
  );
};

export default Page;
