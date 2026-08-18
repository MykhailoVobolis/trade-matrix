import type {
  ForgotPasswordValues,
  ResetPasswordValues,
  SignInValues,
  SignUpValues,
} from "@/lib/auth/auth-schemas";

type SignInResult = {
  redirectTo: string;
};

type SignUpResult = {
  redirectTo: string;
};

type ForgotPasswordResult = {
  redirectTo: string;
};

type ResetPasswordResult = {
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

export async function forgotPasswordRequest(
  values: ForgotPasswordValues,
): Promise<ForgotPasswordResult> {
  await wait(900);

  const normalizedEmail = values.email.toLowerCase();

  if (normalizedEmail === "missing@tradematrix.app") {
    throw new Error("We couldn't find an account with this email.");
  }

  return {
    redirectTo: `/app/check-your-inbox?email=${encodeURIComponent(normalizedEmail)}`,
  };
}

export async function resetPasswordRequest({
  values,
}: {
  values: ResetPasswordValues;
}): Promise<ResetPasswordResult> {
  await wait(1000);

  if (values.password.toLowerCase().includes("password")) {
    throw new Error("Choose a stronger password and try again.");
  }

  return {
    redirectTo: "/app/password-changed",
  };
}

export function getGoogleAuthHref() {
  return "/api/auth/google";
}
