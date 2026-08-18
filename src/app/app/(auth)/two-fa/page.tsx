import { AuthCodeVerification } from "@/components/auth/auth-code-verification";

type TwoFactorPageProps = PageProps<"/app/two-fa">;

export default async function TwoFactorPage({
  searchParams,
}: TwoFactorPageProps) {
  const params = await searchParams;
  const method = params.method === "totp" ? "totp" : "email";

  if (method === "totp") {
    return (
      <AuthCodeVerification
        title="2FA Required"
        description="Open your authenticator app and enter the current 6-digit verification code."
        backHref="/app/sign-in"
        footerText="Use the latest code shown in your authenticator app."
      />
    );
  }

  return (
    <AuthCodeVerification
      title="2FA Required"
      description="We've sent a 6-digit verification code to your email. Please enter it below."
      backHref="/app/sign-in"
      resendHref="/app/two-fa?method=email"
    />
  );
}
