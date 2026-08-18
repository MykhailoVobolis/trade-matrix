import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthGoogleButton } from "@/components/auth/auth-google-button";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <AuthWithVisualLayout
      title="Create your account"
      description="Create a TradeMatrix account for your workspace and prepare the initial access flow."
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sign-up-first-name">First name</Label>
            <Input
              id="sign-up-first-name"
              placeholder="Mykhailo"
              className="h-12 rounded-xl text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sign-up-last-name">Last name</Label>
            <Input
              id="sign-up-last-name"
              placeholder="Vobolis"
              className="h-12 rounded-xl text-base"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sign-up-email">Work email</Label>
            <Input
              id="sign-up-email"
              type="email"
              placeholder="name@company.com"
              className="h-12 rounded-xl text-base"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sign-up-password">Password</Label>
            <Input
              id="sign-up-password"
              type="password"
              placeholder="Create a secure password"
              className="h-12 rounded-xl text-base"
            />
          </div>
        </div>
        <Button size="lg" className="h-12 w-full rounded-xl text-base">
          Create account
        </Button>
        <AuthDivider />
        <AuthGoogleButton label="Sign up with Google" />
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
