import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthGoogleButton } from "@/components/auth/auth-google-button";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignInPage() {
  return (
    <AuthWithVisualLayout
      title="Welcome back"
      description="Use your work email and password to continue into the private TradeMatrix workspace."
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sign-in-email">Email</Label>
            <Input
              id="sign-in-email"
              type="email"
              placeholder="name@company.com"
              className="h-12 rounded-xl text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sign-in-password">Password</Label>
            <Input
              id="sign-in-password"
              type="password"
              placeholder="Enter your password"
              className="h-12 rounded-xl text-base"
            />
            <div className="flex justify-end">
              <Link
                href="/app/forgot-password"
                className="text-sm font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
        <Button size="lg" className="h-12 w-full rounded-xl text-base">
          Sign in
        </Button>
        <AuthDivider />
        <AuthGoogleButton />
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
  );
}
