import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <AuthFormOnlyLayout
      title="Forgot your password?"
      description="Request a password recovery code to continue the reset flow."
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <div className="space-y-2">
          <Label htmlFor="forgot-password-email">Email</Label>
          <Input
            id="forgot-password-email"
            type="email"
            placeholder="name@company.com"
            className="h-12 rounded-xl text-base"
          />
        </div>
        <Button size="lg" className="h-12 w-full rounded-xl text-base">
          Send recovery code
        </Button>
      </AuthFormShell>
    </AuthFormOnlyLayout>
  );
}
