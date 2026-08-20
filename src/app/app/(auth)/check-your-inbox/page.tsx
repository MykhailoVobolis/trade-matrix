"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeftIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { AuthOtpFields } from "@/components/auth/auth-otp-fields";
import { Button } from "@/components/ui/button";
import {
  resendForgotPasswordCodeRequest,
  verifyForgotPasswordCodeRequest,
} from "@/lib/auth/auth-api";
import { useAuthRecoveryStore } from "@/lib/auth/auth-recovery-store";
import { verifyCodeSchema } from "@/lib/auth/auth-schemas";

export default function CheckYourInboxPage() {
  const router = useRouter();
  const email = useAuthRecoveryStore((state) => state.email) ?? "your email";
  const markCodeVerified = useAuthRecoveryStore(
    (state) => state.markCodeVerified,
  );
  const [code, setCode] = useState("");
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const verifyMutation = useMutation({
    mutationFn: () => {
      const parsed = verifyCodeSchema.safeParse({ code });

      if (!parsed.success) {
        throw new Error(
          parsed.error.issues[0]?.message ??
            "Enter the full verification code.",
        );
      }

      if (!email || email === "your email") {
        throw new Error(
          "Missing recovery email. Start the password recovery flow again.",
        );
      }

      return verifyForgotPasswordCodeRequest({
        email,
        code: parsed.data.code,
      });
    },
    onSuccess: ({ recoveryToken }) => {
      markCodeVerified(recoveryToken);
      router.replace("/app/reset-password");
    },
    onError: (error) => {
      setFieldError(
        error instanceof Error
          ? error.message
          : "We couldn't verify the code. Try again.",
      );
    },
  });
  const resendMutation = useMutation({
    mutationFn: () => {
      if (!email || email === "your email") {
        throw new Error(
          "Missing recovery email. Start the password recovery flow again.",
        );
      }

      return resendForgotPasswordCodeRequest({ email });
    },
    onSuccess: () => {
      setFieldError(null);
    },
  });

  async function handleContinue() {
    if (!isCodeComplete || verifyMutation.isPending) {
      return;
    }

    setFieldError(null);
    await verifyMutation.mutateAsync();
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

          {verifyMutation.error ? (
            <AuthInlineMessage variant="error" title="Verification failed">
              {verifyMutation.error.message}
            </AuthInlineMessage>
          ) : null}

          <AuthOtpFields
            onResend={async () => {
              await resendMutation.mutateAsync();
            }}
            disabled={verifyMutation.isPending}
            fieldError={fieldError ?? undefined}
            onCompleteChange={(nextCode, complete) => {
              setCode(nextCode);
              setIsCodeComplete(complete);
              if (fieldError) {
                setFieldError(null);
              }
            }}
          />
        </div>

        <Button
          size="lg"
          className="mt-8 h-12 w-full rounded-xl text-base"
          disabled={!isCodeComplete || verifyMutation.isPending}
          onClick={handleContinue}
        >
          {verifyMutation.isPending ? (
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
