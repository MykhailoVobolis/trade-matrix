"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, LoaderCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { AuthOtpFields } from "@/components/auth/auth-otp-fields";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import {
  startTotpSetupRequest,
  updateTwoFactorMethodRequest,
  verifyTotpSetupRequest,
} from "@/lib/auth/auth-api";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { useAuthTwoFactorStore } from "@/lib/auth/auth-two-factor-store";

export function SetupTwoFactorVerification() {
  const router = useRouter();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const setPreferredMethod = useAuthTwoFactorStore(
    (state) => state.setPreferredMethod,
  );
  const [code, setCode] = useState("");
  const [isCodeComplete, setIsCodeComplete] = useState(false);
  const [hasInvalidCode, setHasInvalidCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    title: string;
    message: string;
    variant: "error" | "warning" | "success";
  } | null>(null);

  const setupQuery = useQuery({
    queryKey: ["totp-setup"],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return startTotpSetupRequest({ accessToken });
    },
    enabled: Boolean(accessToken),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ code }: { code: string }) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return verifyTotpSetupRequest({ accessToken, code });
    },
    onSuccess: async ({ redirectTo }) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      const response = await updateTwoFactorMethodRequest({
        accessToken,
        method: "totp",
      });

      setPreferredMethod(response.method);
      router.replace(redirectTo);
    },
    onError: (error) => {
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

  useEffect(() => {
    const otpauthUrl = setupQuery.data?.otpauthUrl;

    if (!otpauthUrl) {
      return;
    }

    let isCancelled = false;

    void QRCode.toDataURL(otpauthUrl, {
      width: 176,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl: string) => {
        if (!isCancelled) {
          setQrCodeDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setQrCodeDataUrl(null);
          setStatus({
            title: "QR generation failed",
            message:
              "We couldn't generate a scannable QR code. Use the setup key below instead.",
            variant: "warning",
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [setupQuery.data?.otpauthUrl]);

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
          render={<Link href="/app/settings/security" />}
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
                  {setupQuery.data?.otpauthUrl && qrCodeDataUrl ? (
                    <Image
                      src={qrCodeDataUrl}
                      alt="Authenticator setup QR code"
                      width={176}
                      height={176}
                      unoptimized
                      className="size-40 sm:size-44"
                    />
                  ) : (
                    <div className="flex size-40 items-center justify-center sm:size-44">
                      <LoaderCircleIcon className="size-7 animate-spin text-muted-foreground" />
                    </div>
                  )}
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
