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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { changePasswordRequest } from "@/lib/auth/auth-api";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/auth/auth-schemas";

export default function ChangePasswordPage() {
  const router = useRouter();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const signOut = useAuthSessionStore((state) => state.signOut);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      changePasswordRequest({
        newPassword: values.password,
        accessToken: accessToken ?? "",
      }),
    onSuccess: ({ redirectTo }) => {
      signOut();
      router.replace(redirectTo);
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
              <PasswordInput
                {...form.register("password")}
                id="change-password-new"
                placeholder="Enter password"
                aria-invalid={Boolean(form.formState.errors.password)}
                disabled={changePasswordMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.password?.message}
              </AuthFieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-password-confirm">Re-enter password</Label>
              <PasswordInput
                {...form.register("confirmPassword")}
                id="change-password-confirm"
                placeholder="Enter password"
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
