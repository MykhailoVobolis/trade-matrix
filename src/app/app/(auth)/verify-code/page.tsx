import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";

export default function VerifyCodePage() {
  return (
    <AuthWithVisualLayout
      title="Verify your email"
      description="Enter the verification code we send to continue the TradeMatrix account flow."
    >
      <AuthFormShell
        eyebrow="Verify code"
        title="Email verification"
        description="The code input, resend flow, and verification states will be implemented in the next auth verification step."
      />
    </AuthWithVisualLayout>
  );
}
