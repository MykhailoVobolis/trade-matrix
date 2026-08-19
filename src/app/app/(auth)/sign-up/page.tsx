"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFieldError } from "@/components/auth/auth-field-error";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthGoogleButton } from "@/components/auth/auth-google-button";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGoogleAuthHref, signUpRequest } from "@/lib/auth/auth-api";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { signUpSchema, type SignUpValues } from "@/lib/auth/auth-schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function SignUpPage() {
  const router = useRouter();
  const setPendingVerification = useAuthSessionStore(
    (state) => state.setPendingVerification,
  );
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signUpRequest,
    onSuccess: ({ redirectTo, verificationEmail }) => {
      setPendingVerification(verificationEmail);
      router.replace(redirectTo);
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    signUpMutation.reset();
    return signUpMutation.mutateAsync(values);
  });

  return (
    <AuthWithVisualLayout
      title="Create your account"
      description="Create a TradeMatrix account for your workspace and prepare the initial access flow."
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {signUpMutation.error ? (
            <AuthInlineMessage variant="error" title="Sign-up failed">
              {signUpMutation.error.message}
            </AuthInlineMessage>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sign-up-first-name">First name</Label>
              <Input
                {...form.register("firstName")}
                id="sign-up-first-name"
                placeholder="Mykhailo"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.firstName)}
                disabled={signUpMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.firstName?.message}
              </AuthFieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sign-up-last-name">Last name</Label>
              <Input
                {...form.register("lastName")}
                id="sign-up-last-name"
                placeholder="Vobolis"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.lastName)}
                disabled={signUpMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.lastName?.message}
              </AuthFieldError>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sign-up-email">Work email</Label>
              <Input
                {...form.register("email")}
                id="sign-up-email"
                type="email"
                placeholder="name@company.com"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.email)}
                disabled={signUpMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.email?.message}
              </AuthFieldError>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sign-up-password">Password</Label>
              <Input
                {...form.register("password")}
                id="sign-up-password"
                type="password"
                placeholder="Create a secure password"
                className="h-12 rounded-xl text-base"
                aria-invalid={Boolean(form.formState.errors.password)}
                disabled={signUpMutation.isPending}
              />
              <AuthFieldError>
                {form.formState.errors.password?.message}
              </AuthFieldError>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl text-base"
            disabled={signUpMutation.isPending}
          >
            {signUpMutation.isPending ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
        <AuthDivider />
        <AuthGoogleButton
          label="Sign up with Google"
          nativeButton={false}
          render={<Link href={getGoogleAuthHref()} />}
        />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/app/sign-in"
            className="font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
          >
            Sign in
          </Link>
        </p>
      </AuthFormShell>
    </AuthWithVisualLayout>
  );
}
