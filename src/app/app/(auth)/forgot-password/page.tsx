"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthFieldError } from "@/components/auth/auth-field-error";
import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordRequest } from "@/lib/auth/auth-api";
import { useAuthRecoveryStore } from "@/lib/auth/auth-recovery-store";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/auth/auth-schemas";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const startRecovery = useAuthRecoveryStore((state) => state.startRecovery);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: ({ redirectTo, recoveryEmail }) => {
      startRecovery(recoveryEmail);
      router.replace(redirectTo);
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    forgotPasswordMutation.reset();
    return forgotPasswordMutation.mutateAsync(values);
  });

  return (
    <AuthFormOnlyLayout
      title="Forgot your password?"
      description="Request a password recovery code to continue the reset flow."
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {forgotPasswordMutation.error ? (
            <AuthInlineMessage variant="error" title="Recovery request failed">
              {forgotPasswordMutation.error.message}
            </AuthInlineMessage>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="forgot-password-email">Email</Label>
            <Input
              {...form.register("email")}
              id="forgot-password-email"
              type="email"
              placeholder="name@company.com"
              className="h-12 rounded-xl text-base"
              aria-invalid={Boolean(form.formState.errors.email)}
              disabled={forgotPasswordMutation.isPending}
            />
            <AuthFieldError>
              {form.formState.errors.email?.message}
            </AuthFieldError>
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl text-base"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                Sending code...
              </>
            ) : (
              "Send recovery code"
            )}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Back to{" "}
          <Link
            href="/app/sign-in"
            className="font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
          >
            Sign in
          </Link>
        </p>
      </AuthFormShell>
    </AuthFormOnlyLayout>
  );
}
