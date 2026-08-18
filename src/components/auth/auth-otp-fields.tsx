"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";

type AuthOtpFieldsProps = {
  resendHref?: string;
  resendCountdownSeconds?: number;
  resendPrefixText?: string;
  footerText?: string;
  onCompleteChange?: (code: string, complete: boolean) => void;
};

export function AuthOtpFields({
  resendHref,
  resendCountdownSeconds = 30,
  resendPrefixText = "Didn't receive the code?",
  footerText,
  onCompleteChange,
}: AuthOtpFieldsProps) {
  const [code, setCode] = useState(() => Array.from({ length: 6 }, () => ""));
  const [secondsLeft, setSecondsLeft] = useState(
    resendHref && resendCountdownSeconds > 0 ? resendCountdownSeconds : 0,
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const joinedCode = code.join("");
    const isComplete = code.every((digit) => digit.length === 1);
    onCompleteChange?.(joinedCode, isComplete);
  }, [code, onCompleteChange]);

  useEffect(() => {
    if (!resendHref || secondsLeft <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendHref, secondsLeft]);

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
  );
}
