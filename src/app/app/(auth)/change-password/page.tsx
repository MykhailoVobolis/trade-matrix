"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { AuthFieldError } from "@/components/auth/auth-field-error";
import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordRequest } from "@/lib/auth/auth-api";
import { useAuthRecoveryStore } from "@/lib/auth/auth-recovery-store";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/auth/auth-schemas";

export default function ChangePasswordPage() {
  const router = useRouter();
  const markRecoveryCompleted = useAuthRecoveryStore(
    (state) => state.markRecoveryCompleted,
  );
  const clearRecovery = useAuthRecoveryStore((state) => state.clearRecovery);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      resetPasswordRequest({ values }),
    onSuccess: ({ redirectTo }) => {
      markRecoveryCompleted();
      router.replace(redirectTo);
      window.setTimeout(() => {
        clearRecovery();
      }, 0);
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    changePasswordMutation.reset();
    return changePasswordMutation.mutateAsync(values);
  });

  return (
    <AuthFormOnlyLayout
      title="Reset your password"
      description="Enter a new password below to change your password"
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {changePasswordMutation.error ? (
            <AuthInlineMessage variant="error" title="Password reset failed">
              {changePasswordMutation.error.message}
            </AuthInlineMessage>
          ) : null}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="change-password-new">Password</Label>
              <Input
                {...form.register("password")}
                id="change-password-new"
                type="password"
                placeholder="Enter password"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.password)}
                disabled={changePasswordMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.password?.message}
              </AuthFieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-password-confirm">Re-enter password</Label>
              <Input
                {...form.register("confirmPassword")}
                id="change-password-confirm"
                type="password"
                placeholder="Enter password"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                disabled={changePasswordMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.confirmPassword?.message}
              </AuthFieldError>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl text-base"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                Updating password...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </AuthFormShell>
    </AuthFormOnlyLayout>
  );
}
