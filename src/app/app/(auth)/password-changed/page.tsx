import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";

export default function PasswordChangedPage() {
  return (
    <AuthFormOnlyLayout
      title="Password updated"
      description="Confirmation screen for the completed password reset flow."
    >
      <AuthFormShell
        eyebrow="Done"
        title="Password changed"
        description="This status screen stays form-only, matching the simpler Leo recovery pattern."
      />
    </AuthFormOnlyLayout>
  );
}
