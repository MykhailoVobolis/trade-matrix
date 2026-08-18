import type { SignInValues, SignUpValues } from "@/lib/auth/auth-schemas";

type SignInResult = {
  redirectTo: string;
};

type SignUpResult = {
  redirectTo: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function signInRequest(
  values: SignInValues,
): Promise<SignInResult> {
  await wait(900);

  const normalizedEmail = values.email.toLowerCase();

  if (normalizedEmail === "error@tradematrix.app") {
    throw new Error("Invalid email or password.");
  }

  if (normalizedEmail.includes("2fa")) {
    return {
      redirectTo: "/app/two-fa?method=email",
    };
  }

  return {
    redirectTo: "/app",
  };
}

export async function signUpRequest(
  values: SignUpValues,
): Promise<SignUpResult> {
  await wait(1000);

  const normalizedEmail = values.email.toLowerCase();

  if (normalizedEmail === "taken@tradematrix.app") {
    throw new Error("An account with this email already exists.");
  }

  return {
    redirectTo: "/app/verify-code",
  };
}

export function getGoogleAuthHref() {
  return "/api/auth/google";
}
