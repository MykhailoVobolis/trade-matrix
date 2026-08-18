import { AuthCodeVerification } from "@/components/auth/auth-code-verification";

export default function VerifyCodePage() {
  return (
    <AuthCodeVerification
      title="We sent you a code"
      description="We've sent a 6-digit verification code to your email. Please enter it below."
      backHref="/app/sign-up"
      resendHref="/app/verify-code"
    />
  );
}
