"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { AuthOtpFields } from "@/components/auth/auth-otp-fields";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import {
  AuthFlowError,
  startTotpSetupRequest,
  verifyTotpSetupRequest,
} from "@/lib/auth/auth-api";
import { cn } from "@/lib/utils";

function createMockQrCells(value: string) {
  const size = 25;
  let seed = 0;

  for (const char of value) {
    seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  }

  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    const inTopLeftFinder = row < 7 && column < 7;
    const inTopRightFinder = row < 7 && column >= size - 7;
    const inBottomLeftFinder = row >= size - 7 && column < 7;

    if (inTopLeftFinder || inTopRightFinder || inBottomLeftFinder) {
      const localRow = row % 7;
      const localColumn = column % 7;
      const outer =
        localRow === 0 ||
        localRow === 6 ||
        localColumn === 0 ||
        localColumn === 6;
      const inner =
        localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;

      return outer || inner;
    }

    const noise = (seed + row * 17 + column * 29 + row * column * 13) % 5;
    return noise === 0 || noise === 2;
  });
}

export function SetupTwoFactorVerification() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [hasInvalidCode, setHasInvalidCode] = useState(false);
  const [status, setStatus] = useState<{
    title: string;
    message: string;
    variant: "error" | "warning" | "success";
  } | null>(null);

  const setupQuery = useQuery({
    queryKey: ["totp-setup"],
    queryFn: startTotpSetupRequest,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyTotpSetupRequest,
    onSuccess: ({ redirectTo }) => {
      setHasInvalidCode(false);
      setStatus({
        title: "Authenticator connected",
        message:
          "Two-factor authentication is ready. Returning you to Security settings.",
        variant: "success",
      });

      window.setTimeout(() => {
        router.replace(redirectTo);
      }, 900);
    },
    onError: (error) => {
      if (error instanceof AuthFlowError) {
        if (error.code === "invalid_code") {
          setHasInvalidCode(true);
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
        title: "Setup failed",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't finish the authenticator setup. Try again.",
        variant: "error",
      });
    },
  });

  const qrCells = useMemo(
    () => createMockQrCells(setupQuery.data?.otpauthUrl ?? ""),
    [setupQuery.data?.otpauthUrl],
  );

  const fieldErrorMessage =
    status?.variant === "error" ? status.message : undefined;
  const bannerStatus = status && status.variant !== "error" ? status : null;

  async function handleSubmit() {
    if (code.length !== 6) {
      setHasInvalidCode(false);
      setStatus({
        title: "Incomplete code",
        message: "Enter the full 6-digit verification code.",
        variant: "error",
      });
      return;
    }

    setHasInvalidCode(false);
    setStatus(null);

    try {
      await verifyMutation.mutateAsync({ code });
    } catch {
      // Handled in mutation callbacks.
    }
  }

  return (
    <AuthWithVisualLayout
      title={
        <>
          Set-up 2-Factor
          <br />
          Authentication App
        </>
      }
      description="Scan the QR code in your authenticator app, then enter the first 6-digit code to finish setup."
      topAction={
        <Button
          nativeButton={false}
          render={<Link href="/app/settings?tab=Security" />}
          variant="outline"
          size="lg"
          className="w-fit rounded-xl px-5"
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

        <div className="space-y-8">
          <div className="rounded-[2rem] border border-border/80 bg-background p-6 text-center shadow-sm">
            {setupQuery.isPending ? (
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="flex size-56 items-center justify-center rounded-[1.5rem] border border-border/80 bg-white shadow-sm">
                  <LoaderCircleIcon className="size-7 animate-spin text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Preparing your authenticator setup...
                </p>
              </div>
            ) : setupQuery.isError ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <p className="text-sm text-destructive">
                  Failed to load the authenticator setup payload.
                </p>
                <Button variant="outline" onClick={() => setupQuery.refetch()}>
                  Try again
                </Button>
              </div>
            ) : (
              <div className="mx-auto flex w-fit flex-col items-center gap-6">
                <div className="rounded-[1.5rem] border border-border/80 bg-white p-4 shadow-sm">
                  <div className="grid size-40 grid-cols-25 gap-px sm:size-44">
                    {qrCells.map((filled, index) => (
                      <div
                        key={index}
                        className={cn(
                          "rounded-[1px]",
                          filled ? "bg-black" : "bg-white",
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-base leading-none font-medium tracking-tight">
                    Can&apos;t scan the code?
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Use this setup key in your authenticator app:
                    </p>
                    <p className="font-mono text-[1.05rem] tracking-[0.08em] text-foreground">
                      {setupQuery.data?.setupKey}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AuthOtpFields
            disabled={
              verifyMutation.isPending ||
              setupQuery.isPending ||
              setupQuery.isError
            }
            invalid={hasInvalidCode}
            fieldError={fieldErrorMessage}
            footerText="Use the first code generated for this new TradeMatrix setup."
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
        </div>

        <Button
          size="lg"
          className="mt-8 h-12 w-full rounded-xl text-base"
          disabled={
            !isCodeComplete ||
            verifyMutation.isPending ||
            setupQuery.isPending ||
            setupQuery.isError
          }
          onClick={handleSubmit}
        >
          {verifyMutation.isPending ? (
            <>
              <LoaderCircleIcon className="animate-spin" />
              Confirming...
            </>
          ) : (
            "Confirm Code"
          )}
        </Button>
      </AuthFormShell>
    </AuthWithVisualLayout>
  );
}
