import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  return (
    <AuthFormOnlyLayout
      title="Reset your password"
      description="Choose a new password to restore access to your TradeMatrix account."
    >
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password-new">New password</Label>
            <Input
              id="reset-password-new"
              type="password"
              placeholder="Create a new password"
              className="h-12 rounded-xl text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-password-confirm">Confirm password</Label>
            <Input
              id="reset-password-confirm"
              type="password"
              placeholder="Repeat the new password"
              className="h-12 rounded-xl text-base"
            />
          </div>
        </div>
        <Button size="lg" className="h-12 w-full rounded-xl text-base">
          Update password
        </Button>
      </AuthFormShell>
    </AuthFormOnlyLayout>
  );
}
