import { TwoFactorVerification } from "@/components/auth/two-factor-verification";

type TwoFactorPageProps = PageProps<"/app/two-fa">;

export default async function TwoFactorPage({
  searchParams,
}: TwoFactorPageProps) {
  const params = await searchParams;
  const method = params.method === "totp" ? "totp" : "email";

  return <TwoFactorVerification method={method} />;
}
