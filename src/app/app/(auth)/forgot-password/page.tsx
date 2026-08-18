import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthFormOnlyLayout
      title="Forgot your password?"
      description="Request a password recovery code to continue the reset flow."
    >
      <AuthFormShell
        eyebrow="Recovery"
        title="Password assistance"
        description="This screen intentionally follows the Leo form-only pattern without a visual side panel."
      />
    </AuthFormOnlyLayout>
  );
}
