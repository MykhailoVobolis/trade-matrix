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
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { verifyCodeSchema } from "@/lib/auth/auth-schemas";

const maxAttempts = 3;

export default function VerifyCodePage() {
  const router = useRouter();
  const pendingVerification = useAuthSessionStore(
    (state) => state.pendingVerification,
  );
  const completeSignIn = useAuthSessionStore((state) => state.completeSignIn);
  const clearPendingVerification = useAuthSessionStore(
    (state) => state.clearPendingVerification,
  );
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
    onSuccess: ({ redirectTo, accessToken, currentUser }) => {
      completeSignIn({
        accessToken,
        currentUser,
      });
      clearPendingVerification();
      router.replace(redirectTo);
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
                "You have reached the retry limit. Request a new code to continue.",
              variant: "warning",
            });
            return;
          }

          setStatus({
            title: "Invalid code",
            message: error.message,
            variant: "error",
          });
          return;
        }

        if (error.code === "expired_code") {
          setHasInvalidCode(false);
          setStatus({
            title: "Code expired",
            message: error.message,
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
    mutationFn: () => {
      if (!pendingVerification?.email) {
        throw new Error(
          "Missing verification email. Start the sign-up flow again.",
        );
      }

      return resendVerificationCodeRequest({
        email: pendingVerification.email,
      });
    },
    onSuccess: () => {
      setAttemptCount(0);
      setIsLocked(false);
      setHasInvalidCode(false);
      setStatus(null);
    },
  });

  async function handleSubmit() {
    if (!pendingVerification?.email) {
      setStatus({
        title: "Missing verification context",
        message:
          "Start the sign-up flow again to receive a new verification code.",
        variant: "warning",
      });
      return;
    }

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
        email: pendingVerification.email,
        code: parsed.data.code,
      });
    } catch {
      // The mutation error is handled via onError state updates.
    }
  }

  return (
    <AuthWithVisualLayout
      title="We sent you a code"
      description="We've sent a 6-digit verification code to your email. Please enter it below."
      topAction={
        <Button
          nativeButton={false}
          render={<Link href="/app/sign-up" />}
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
          onResend={async () => {
            await resendMutation.mutateAsync();
          }}
          resendCountdownSeconds={30}
          disabled={verifyMutation.isPending}
          invalid={hasInvalidCode}
          fieldError={fieldErrorMessage}
          onEnter={isLocked ? undefined : handleSubmit}
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
