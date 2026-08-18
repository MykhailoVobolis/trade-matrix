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
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/auth/auth-schemas";

export default function ResetPasswordPage() {
  const router = useRouter();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      resetPasswordRequest({ values }),
    onSuccess: ({ redirectTo }) => {
      router.replace(redirectTo);
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    resetPasswordMutation.reset();
    return resetPasswordMutation.mutateAsync(values);
  });

  return (
    <AuthFormOnlyLayout
      title="Reset your password"
      description="Enter a new password below to change your password"
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {resetPasswordMutation.error ? (
            <AuthInlineMessage variant="error" title="Password reset failed">
              {resetPasswordMutation.error.message}
            </AuthInlineMessage>
          ) : null}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password-new">New password</Label>
              <Input
                {...form.register("password")}
                id="reset-password-new"
                type="password"
                placeholder="Create a new password"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.password)}
                disabled={resetPasswordMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.password?.message}
              </AuthFieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-password-confirm">Confirm password</Label>
              <Input
                {...form.register("confirmPassword")}
                id="reset-password-confirm"
                type="password"
                placeholder="Repeat the new password"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                disabled={resetPasswordMutation.isPending}
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
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </AuthFormShell>
    </AuthFormOnlyLayout>
  );
}
