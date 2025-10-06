"use client";

import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAuthVerifyOTPMutation } from "@/tanstack/mutations/auth.mutations";

interface OTPFormProps extends React.ComponentProps<"div"> {
  email?: string;
}

export function OTPForm({ className, email, ...props }: OTPFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState<string>("");
  const {
    mutate: verifyOTP,
    isPending: isVerifying,
    isSuccess: isVerified,
    isError: isVerifyError,
    error: verifyError,
  } = useAuthVerifyOTPMutation({ router });

  useEffect(() => {
    if (isVerified && !isVerifying && !isVerifyError) {
      toast.success("Email verified successfully!", { duration: 1500 });
    }
  }, [isVerified, isVerifying, isVerifyError]);

  if (email === undefined) {
    toast.error("Email is required to verify OTP", { duration: 2000 });
    return null;
  }

  const handleVerify = () => verifyOTP({ email, token: otp });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify();
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Enter verification code
            </h1>
            <FieldDescription className="text-neutral-700 dark:text-neutral-300">
              We sent a 6-digit code to your email address
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              required
              onChange={(value) => setOtp(value)}
              containerClassName="gap-4"
            >
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-center">
              Didn&apos;t receive the code? <a href="#">Resend</a>
            </FieldDescription>
          </Field>
          <Field>
            <Button
              type="submit"
              disabled={otp.length < 6 || isVerifying}
              className="w-full"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
