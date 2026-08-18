"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type AuthOtpFieldsProps = {
  resendHref?: string;
  onResend?: () => Promise<void> | void;
  resendCountdownSeconds?: number;
  resendPrefixText?: string;
  footerText?: string;
  fieldError?: string;
  onCompleteChange?: (code: string, complete: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
};

export function AuthOtpFields({
  resendHref,
  onResend,
  resendCountdownSeconds = 30,
  resendPrefixText = "Didn't receive the code?",
  footerText,
  fieldError,
  onCompleteChange,
  disabled = false,
  invalid = false,
}: AuthOtpFieldsProps) {
  const [code, setCode] = useState(() => Array.from({ length: 6 }, () => ""));
  const [secondsLeft, setSecondsLeft] = useState(
    (resendHref || onResend) && resendCountdownSeconds > 0
      ? resendCountdownSeconds
      : 0,
  );
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const onCompleteChangeRef = useRef(onCompleteChange);

  useEffect(() => {
    onCompleteChangeRef.current = onCompleteChange;
  }, [onCompleteChange]);

  useEffect(() => {
    const joinedCode = code.join("");
    const isComplete = code.every((digit) => digit.length === 1);
    onCompleteChangeRef.current?.(joinedCode, isComplete);
  }, [code]);

  useEffect(() => {
    if ((!resendHref && !onResend) || secondsLeft <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [onResend, resendHref, secondsLeft]);

  async function handleResendAction() {
    if (!onResend || secondsLeft > 0 || isResending) {
      return;
    }

    setIsResending(true);

    try {
      await onResend();
      setSecondsLeft(resendCountdownSeconds);
    } finally {
      setIsResending(false);
    }
  }

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
    <div className="space-y-8">
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            aria-label={`Verification digit ${index + 1}`}
            aria-invalid={invalid}
            type="text"
            inputMode="numeric"
            maxLength={1}
            placeholder="0"
            value={code[index]}
            disabled={disabled}
            onChange={(event) => updateDigit(index, event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !code[index] && index > 0) {
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
            className={cn(
              "h-18 w-full rounded-2xl border bg-background px-0 text-center text-4xl font-medium caret-transparent outline-none transition-colors placeholder:font-medium md:text-4xl",
              "focus:border-ring focus:ring-3 focus:ring-ring/15",
              "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
              "dark:bg-background",
              invalid
                ? "border-red-500 text-red-500 placeholder:text-red-400/50 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:text-red-400 dark:placeholder:text-red-400/45 dark:focus:ring-red-500/25"
                : "border-border/80 text-foreground placeholder:text-muted-foreground/35",
            )}
          />
        ))}
      </div>

      {fieldError ? (
        <p className="text-center text-sm text-destructive">{fieldError}</p>
      ) : null}

      {resendHref || onResend ? (
        <p className="text-center text-sm text-muted-foreground">
          {resendPrefixText}{" "}
          {secondsLeft > 0 ? (
            <span className="font-medium text-muted-foreground">
              Resend in {secondsLeft}s
            </span>
          ) : onResend ? (
            <button
              type="button"
              className="font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80 disabled:text-muted-foreground"
              disabled={isResending}
              onClick={handleResendAction}
            >
              Resend
            </button>
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
  );
}
