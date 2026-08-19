import type {
  ForgotPasswordValues,
  ResetPasswordValues,
  SignInValues,
  SignUpValues,
  VerifyCodeValues,
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

type VerifyCodeResult = {
  redirectTo: string;
};

type TotpSetupResult = {
  otpauthUrl: string;
  setupKey: string;
};

type TotpSetupVerificationResult = {
  redirectTo: string;
};

export class AuthFlowError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_code" | "expired_code" | "too_many_attempts",
  ) {
    super(message);
    this.name = "AuthFlowError";
  }
}

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

export async function verifyCodeRequest({
  code,
  attempt,
}: VerifyCodeValues & {
  attempt: number;
}): Promise<VerifyCodeResult> {
  await wait(900);

  if (code === "000000") {
    throw new AuthFlowError(
      "This verification code has expired. Request a new one and try again.",
      "expired_code",
    );
  }

  if (attempt >= 3) {
    throw new AuthFlowError(
      "Too many invalid attempts. Wait a moment before trying again.",
      "too_many_attempts",
    );
  }

  if (code !== "123456") {
    throw new AuthFlowError(
      "That code is invalid. Check the email we sent and try again.",
      "invalid_code",
    );
  }

  return {
    redirectTo: "/app/sign-in",
  };
}

export async function resendVerificationCodeRequest(): Promise<void> {
  await wait(700);
}

export async function startTotpSetupRequest(): Promise<TotpSetupResult> {
  await wait(800);

  return {
    otpauthUrl:
      "otpauth://totp/TradeMatrix:demo%40tradematrix.app?secret=EQQNMKTBY3MF4DWFYITCIWM5YM2FFBZJ&issuer=TradeMatrix&algorithm=SHA1&digits=6&period=30",
    setupKey: "EQQNMKTBY3MF4DWFYITCIWM5YM2FFBZJ",
  };
}

export async function verifyTotpSetupRequest({
  code,
}: VerifyCodeValues): Promise<TotpSetupVerificationResult> {
  await wait(900);

  if (code === "000000") {
    throw new AuthFlowError(
      "That authenticator code has expired. Enter the latest code from your app and try again.",
      "expired_code",
    );
  }

  if (code !== "123456") {
    throw new AuthFlowError(
      "That code is invalid. Check the current code in your authenticator app and try again.",
      "invalid_code",
    );
  }

  return {
    redirectTo: "/app/settings/security",
  };
}

export function getGoogleAuthHref() {
  return "/api/auth/google";
}
