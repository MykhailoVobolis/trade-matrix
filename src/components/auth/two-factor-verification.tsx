"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon, ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { AuthOtpFields } from "@/components/auth/auth-otp-fields";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import {
  AuthFlowError,
  resendVerificationCodeRequest,
  verifyCodeRequest,
} from "@/lib/auth/auth-api";
import { verifyCodeSchema } from "@/lib/auth/auth-schemas";

type TwoFactorVerificationProps = {
  method: "email" | "totp";
};

const maxAttempts = 3;

export function TwoFactorVerification({ method }: TwoFactorVerificationProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [hasInvalidCode, setHasInvalidCode] = useState(false);
  const [status, setStatus] = useState<{
    title: string;
    message: string;
    variant: "error" | "warning";
  } | null>(null);

  const fieldErrorMessage =
    status?.variant === "error" ? status.message : undefined;
  const bannerStatus = status?.variant === "warning" ? status : null;

  const verifyMutation = useMutation({
    mutationFn: verifyCodeRequest,
    onSuccess: ({ redirectTo }) => {
      router.replace(redirectTo === "/app/sign-in" ? "/app" : redirectTo);
    },
    onError: (error) => {
      if (error instanceof AuthFlowError) {
        if (error.code === "invalid_code") {
          const nextAttempt = attemptCount + 1;
          setAttemptCount(nextAttempt);
          setHasInvalidCode(true);

          if (nextAttempt >= maxAttempts) {
            setIsLocked(true);
            setStatus({
              title: "Too many attempts",
              message:
                method === "totp"
                  ? "You have reached the retry limit. Wait a moment and use a fresh code from your authenticator app."
                  : "You have reached the retry limit. Request a new code to continue.",
              variant: "warning",
            });
            return;
          }

          setStatus({
            title: "Invalid code",
            message:
              method === "totp"
                ? "That code is invalid. Check the current code in your authenticator app and try again."
                : error.message,
            variant: "error",
          });
          return;
        }

        if (error.code === "expired_code") {
          setHasInvalidCode(false);
          setStatus({
            title: "Code expired",
            message:
              method === "totp"
                ? "That authenticator code has expired. Enter the latest code from your app and try again."
                : error.message,
            variant: "warning",
          });
          return;
        }
      }

      setHasInvalidCode(false);
      setStatus({
        title: "Verification failed",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't verify the code. Try again.",
        variant: "error",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerificationCodeRequest,
    onSuccess: () => {
      setAttemptCount(0);
      setIsLocked(false);
      setHasInvalidCode(false);
      setStatus(null);
    },
  });

  async function handleSubmit() {
    const parsed = verifyCodeSchema.safeParse({ code });

    if (!parsed.success) {
      setHasInvalidCode(false);
      setStatus({
        title: "Incomplete code",
        message: parsed.error.issues[0]?.message ?? "Enter the full code.",
        variant: "error",
      });
      return;
    }

    setHasInvalidCode(false);
    setStatus(null);
    verifyMutation.reset();

    try {
      await verifyMutation.mutateAsync({
        code: parsed.data.code,
        attempt: attemptCount,
      });
    } catch {
      // The mutation error is handled via onError state updates.
    }
  }

  return (
    <AuthWithVisualLayout
      title="2FA Required"
      description={
        method === "totp"
          ? "Open your authenticator app and enter the current 6-digit verification code."
          : "We've sent a 6-digit verification code to your email. Please enter it below."
      }
      topAction={
        <Button
          nativeButton={false}
          render={<Link href="/app/sign-in" />}
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
        {bannerStatus ? (
          <AuthInlineMessage
            variant={bannerStatus.variant}
            title={bannerStatus.title}
            className="mb-6"
          >
            {bannerStatus.message}
          </AuthInlineMessage>
        ) : null}
        <AuthOtpFields
          onResend={
            method === "email" ? () => resendMutation.mutateAsync() : undefined
          }
          resendCountdownSeconds={30}
          disabled={verifyMutation.isPending}
          invalid={hasInvalidCode}
          fieldError={fieldErrorMessage}
          footerText={
            method === "totp"
              ? "Use the latest code shown in your authenticator app."
              : undefined
          }
          onCompleteChange={(nextCode, complete) => {
            setCode(nextCode);
            setIsCodeComplete(complete);
            if (hasInvalidCode) {
              setHasInvalidCode(false);
            }
            if (status?.variant === "error") {
              setStatus(null);
            }
          }}
        />
        <Button
          size="lg"
          className="mt-8 h-12 w-full rounded-xl text-base"
          disabled={!isCodeComplete || verifyMutation.isPending || isLocked}
          onClick={handleSubmit}
        >
          {verifyMutation.isPending ? (
            <>
              <LoaderCircleIcon className="animate-spin" />
              Verifying...
            </>
          ) : (
            "Confirm Code"
          )}
        </Button>
      </AuthFormShell>
    </AuthWithVisualLayout>
  );
}
