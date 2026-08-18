import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";

export default function SetupTwoFactorPage() {
  return (
    <AuthFormOnlyLayout
      title="Set up two-factor authentication"
      description="Prepare your authenticator app setup flow, including QR code and verification steps."
    >
      <AuthFormShell
        eyebrow="Security"
        title="Authenticator setup"
        description="The QR code and TOTP verification experience will be implemented in the dedicated setup-2fa step."
      />
    </AuthFormOnlyLayout>
  );
}
