import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";

export default function ResetPasswordPage() {
  return (
    <AuthFormOnlyLayout
      title="Reset your password"
      description="Choose a new password to restore access to your TradeMatrix account."
    >
      <AuthFormShell
        eyebrow="Reset password"
        title="New password"
        description="The password reset form and visibility controls will be added in the dedicated recovery step."
      />
    </AuthFormOnlyLayout>
  );
}
