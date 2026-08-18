import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";

export default function TwoFactorPage() {
  return (
    <AuthWithVisualLayout
      title="Two-factor authentication"
      description="Confirm your identity with a verification code before entering the private workspace."
    >
      <AuthFormShell
        eyebrow="Two-factor"
        title="Verification code"
        description="The two-factor code entry flow will be added next, with support for the agreed email-based method."
      />
    </AuthWithVisualLayout>
  );
}
