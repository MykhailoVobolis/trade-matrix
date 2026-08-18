import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";

export default function SignInPage() {
  return (
    <AuthWithVisualLayout
      title="Welcome back"
      description="Access your TradeMatrix workspace, session controls, and private analytics routes."
    >
      <AuthFormShell
        eyebrow="Sign in"
        title="Account access"
        description="Auth form UI will be implemented in the next step on top of this shared visual layout."
      />
    </AuthWithVisualLayout>
  );
}
