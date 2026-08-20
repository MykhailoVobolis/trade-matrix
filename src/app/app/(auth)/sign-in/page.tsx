"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFieldError } from "@/components/auth/auth-field-error";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthGoogleButton } from "@/components/auth/auth-google-button";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { PublicAuthRouteGuard } from "@/components/auth/public-auth-route-guard";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { getGoogleAuthHref, signInRequest } from "@/lib/auth/auth-api";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { signInSchema, type SignInValues } from "@/lib/auth/auth-schemas";
import { useAuthTwoFactorStore } from "@/lib/auth/auth-two-factor-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function SignInPage() {
  const router = useRouter();
  const completeSignIn = useAuthSessionStore((state) => state.completeSignIn);
  const clearPendingVerification = useAuthSessionStore(
    (state) => state.clearPendingVerification,
  );
  const startChallenge = useAuthTwoFactorStore((state) => state.startChallenge);
  const clearChallenge = useAuthTwoFactorStore((state) => state.clearChallenge);
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = useMutation({
    mutationFn: signInRequest,
    onSuccess: ({ redirectTo, currentUser, accessToken, pendingTwoFactor }) => {
      clearPendingVerification();

      if (pendingTwoFactor) {
        startChallenge({
          method: pendingTwoFactor.method,
          twoFactorToken: pendingTwoFactor.twoFactorToken,
          redirectTo: "/app",
        });
        router.replace(redirectTo);
        return;
      }

      clearChallenge();

      if (currentUser && accessToken) {
        completeSignIn({
          accessToken,
          currentUser,
        });
      }

      router.replace(redirectTo);
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    signInMutation.reset();
    return signInMutation.mutateAsync(values);
  });

  return (
    <PublicAuthRouteGuard>
      <AuthWithVisualLayout
        title="Welcome back"
        description="Use your work email and password to continue into the private TradeMatrix workspace."
      >
        <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {signInMutation.error ? (
              <AuthInlineMessage variant="error" title="Sign-in failed">
                {signInMutation.error.message}
              </AuthInlineMessage>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="sign-in-email">Email</Label>
              <Input
                {...form.register("email")}
                id="sign-in-email"
                type="email"
                placeholder="Enter your email"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.email)}
                disabled={signInMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.email?.message}
              </AuthFieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sign-in-password">Password</Label>
              <PasswordInput
                {...form.register("password")}
                id="sign-in-password"
                placeholder="Enter your password"
                aria-invalid={Boolean(form.formState.errors.password)}
                disabled={signInMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.password?.message}
              </AuthFieldError>
              <div className="flex justify-end">
                <Link
                  href="/app/forgot-password"
                  className="text-sm font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-xl text-base"
              disabled={signInMutation.isPending}
            >
              {signInMutation.isPending ? (
                <>
                  <LoaderCircleIcon className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          <AuthDivider />
          <AuthGoogleButton
            nativeButton={false}
            render={<Link href={getGoogleAuthHref()} />}
          />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/app/sign-up"
              className="font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
            >
              Sign up
            </Link>
          </p>
        </AuthFormShell>
      </AuthWithVisualLayout>
    </PublicAuthRouteGuard>
  );
}
