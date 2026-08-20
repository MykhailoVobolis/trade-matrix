"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

import { AuthOtpFields } from "@/components/auth/auth-otp-fields";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";

type AuthCodeVerificationProps = {
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
  confirmLabel?: string;
  resendHref?: string;
  resendCountdownSeconds?: number;
  resendPrefixText?: string;
  footerText?: string;
};

export function AuthCodeVerification({
  title,
  description,
  backHref,
  backLabel = "Back",
  confirmLabel = "Confirm Code",
  resendHref,
  resendCountdownSeconds = 30,
  resendPrefixText = "Didn't receive the code?",
  footerText,
}: AuthCodeVerificationProps) {
  const [isCodeComplete, setIsCodeComplete] = useState(false);

  return (
    <AuthWithVisualLayout
      title={title}
      description={description}
      headerClassName="px-4 text-center lg:text-center"
      topAction={
        <Button
          nativeButton={false}
          render={<Link href={backHref} />}
          variant="outline"
          size="lg"
          className="w-fit px-5"
        >
          <ChevronLeftIcon className="size-4" />
          {backLabel}
        </Button>
      }
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <AuthOtpFields
          resendHref={resendHref}
          resendCountdownSeconds={resendCountdownSeconds}
          resendPrefixText={resendPrefixText}
          footerText={footerText}
          onCompleteChange={(_, complete) => setIsCodeComplete(complete)}
        />
        <Button
          size="lg"
          className="mt-8 h-12 w-full rounded-xl text-base"
          disabled={!isCodeComplete}
        >
          {confirmLabel}
        </Button>
      </AuthFormShell>
    </AuthWithVisualLayout>
  );
}
