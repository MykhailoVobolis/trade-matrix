"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeftIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthOtpFields } from "@/components/auth/auth-otp-fields";
import { Button } from "@/components/ui/button";
import { resendVerificationCodeRequest } from "@/lib/auth/auth-api";
import { useAuthRecoveryStore } from "@/lib/auth/auth-recovery-store";

export default function CheckYourInboxPage() {
  const router = useRouter();
  const email = useAuthRecoveryStore((state) => state.email) ?? "your email";
  const markCodeVerified = useAuthRecoveryStore(
    (state) => state.markCodeVerified,
  );
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resendMutation = useMutation({
    mutationFn: resendVerificationCodeRequest,
  });

  async function handleContinue() {
    if (!isCodeComplete || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    markCodeVerified();
    router.replace("/app/reset-password");
  }

  return (
    <AuthFormOnlyLayout
      topAction={
        <Button
          nativeButton={false}
          render={<Link href="/app/forgot-password" />}
          variant="outline"
          size="lg"
          className="w-fit px-5"
        >
          <ChevronLeftIcon className="size-4" />
          Back
        </Button>
      }
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <div className="space-y-8 text-center">
          <div className="space-y-3 px-4">
            <h1 className="text-[36px] font-semibold tracking-tight">
              Check your inbox
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Enter the verification code we just sent to
            </p>
            <p className="text-lg font-semibold tracking-tight">{email}</p>
          </div>

          <AuthOtpFields
            onResend={() => resendMutation.mutateAsync()}
            onCompleteChange={(_, complete) => setIsCodeComplete(complete)}
          />
        </div>

        <Button
          size="lg"
          className="mt-8 h-12 w-full rounded-xl text-base"
          disabled={!isCodeComplete || isSubmitting}
          onClick={handleContinue}
        >
          {isSubmitting ? (
            <>
              <LoaderCircleIcon className="animate-spin" />
              Continue
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </AuthFormShell>
    </AuthFormOnlyLayout>
  );
}
