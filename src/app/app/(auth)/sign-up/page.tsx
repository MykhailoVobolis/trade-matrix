import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthWithVisualLayout } from "@/components/auth/auth-with-visual-layout";

export default function SignUpPage() {
  return (
    <AuthWithVisualLayout
      title="Create your account"
      description="Set up TradeMatrix access for your team with a reusable auth layout and product-side visual context."
    >
      <AuthFormShell
        eyebrow="Sign up"
        title="Registration"
        description="Registration form fields and validation will be added in the next auth forms step."
      />
    </AuthWithVisualLayout>
  );
}
