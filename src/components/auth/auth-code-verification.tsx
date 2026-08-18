"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [code, setCode] = useState(() => Array.from({ length: 6 }, () => ""));
  const [secondsLeft, setSecondsLeft] = useState(
    resendHref ? resendCountdownSeconds : 0,
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!resendHref || secondsLeft <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendHref, secondsLeft]);

  const isCodeComplete = code.every((digit) => digit.length === 1);

  function focusInput(index: number) {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  function updateDigit(index: number, rawValue: string) {
    const nextDigit = rawValue.replace(/\D/g, "").slice(-1);

    setCode((current) => {
      const next = [...current];
      next[index] = nextDigit;
      return next;
    });

    if (nextDigit && index < 5) {
      focusInput(index + 1);
    }
  }

  function handlePaste(text: string) {
    const sanitized = text.replace(/\D/g, "").slice(0, 6);

    if (!sanitized) {
      return;
    }

    setCode((current) => {
      const next = [...current];

      sanitized.split("").forEach((digit, index) => {
        next[index] = digit;
      });

      return next;
    });

    const nextIndex = Math.min(sanitized.length, 5);
    focusInput(nextIndex);
  }

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
          className="w-fit rounded-xl px-5"
        >
          <ChevronLeftIcon className="size-4" />
          {backLabel}
        </Button>
      }
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <div className="space-y-8">
          <div className="space-y-8">
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Input
                  key={index}
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  aria-label={`Verification digit ${index + 1}`}
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="0"
                  value={code[index]}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Backspace" &&
                      !code[index] &&
                      index > 0
                    ) {
                      focusInput(index - 1);
                    }

                    if (event.key === "ArrowLeft" && index > 0) {
                      event.preventDefault();
                      focusInput(index - 1);
                    }

                    if (event.key === "ArrowRight" && index < 5) {
                      event.preventDefault();
                      focusInput(index + 1);
                    }
                  }}
                  onPaste={(event) => {
                    event.preventDefault();
                    handlePaste(event.clipboardData.getData("text"));
                  }}
                  className="h-18 rounded-2xl border-border/80 bg-background px-0 text-center text-4xl font-medium caret-transparent placeholder:font-medium placeholder:text-muted-foreground/45 md:text-4xl"
                />
              ))}
            </div>

            {resendHref ? (
              <p className="text-center text-sm text-muted-foreground">
                {resendPrefixText}{" "}
                {secondsLeft > 0 ? (
                  <span className="font-medium text-muted-foreground">
                    Resend in {secondsLeft}s
                  </span>
                ) : (
                  <Link
                    href={resendHref}
                    className="font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
                  >
                    Resend
                  </Link>
                )}
              </p>
            ) : footerText ? (
              <p className="text-center text-sm text-muted-foreground">
                {footerText}
              </p>
            ) : null}
          </div>
        </div>
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
