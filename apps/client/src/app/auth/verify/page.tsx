"use client";

import { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    // 1. Add a new entry to the history stack
    window.history.pushState(null, "", window.location.href);

    // 2. Define the event handler for the 'popstate' event
    const handleBackButton = (event: PopStateEvent) => {
      // The popstate event is fired when the user navigates through history
      // We push them forward again, effectively canceling the back action
      window.history.pushState(null, "", window.location.href);
      // You could also use history.go(1);
    };

    // 3. Add the event listener when the component mounts
    window.addEventListener("popstate", handleBackButton);

    // 4. Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []); // The empty dependency array ensures this runs only once on mount

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        {/* <OTPForm email={email as string} /> */}
        <h3 className="text-lg font-semibold">
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
        </p>
      </div>
    </div>
  );
};

export default Page;
