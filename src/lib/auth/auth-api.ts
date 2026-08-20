import { ApiError, requestJson } from "@/lib/api/http-client";
import type {
  ForgotPasswordValues,
  ResetPasswordValues,
  SignInValues,
  SignUpValues,
  VerifyCodeValues,
} from "@/lib/auth/auth-schemas";
import type {
  AuthSession,
  AuthUser,
  TwoFactorMethod,
} from "@/lib/auth/auth-model";

type MessageResponse = {
  message: string;
};

type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  message: string;
  user: AuthUser;
};

type TwoFactorChallengeResponse = {
  requiresTwoFactor: true;
  twoFactorToken: string;
  method: TwoFactorMethod;
  message: string;
};

type SignInResult = {
  redirectTo: string;
  accessToken?: string;
  currentUser?: AuthUser;
  pendingTwoFactor?: {
    method: TwoFactorMethod;
    twoFactorToken: string;
  };
};

type SignUpResult = {
  redirectTo: string;
  verificationEmail: string;
  message: string;
};

type ForgotPasswordResult = {
  redirectTo: string;
  recoveryEmail: string;
  message: string;
};

type ResetPasswordResult = {
  redirectTo: string;
  message: string;
};

type VerifyCodeResult = {
  redirectTo: string;
  message: string;
  accessToken: string;
  currentUser: AuthUser;
};

type VerifyTwoFactorResult = {
  redirectTo: string;
  accessToken: string;
  currentUser: AuthUser;
  message: string;
};

type TotpSetupResult = {
  secret: string;
  otpauthUrl: string;
};

type TotpSetupVerificationResult = {
  redirectTo: string;
  message: string;
};

type RefreshSessionResult = {
  accessToken: string;
  currentUser: AuthUser;
};

type ForgotPasswordVerifyResult = {
  recoveryToken: string;
  message: string;
};

type TwoFactorSettingsResponse = {
  isTwoFactorEnabled: boolean;
  method: TwoFactorMethod;
  isTotpEnabled: boolean;
};

function isTwoFactorChallenge(
  response: AuthResponse | TwoFactorChallengeResponse,
): response is TwoFactorChallengeResponse {
  return "requiresTwoFactor" in response;
}

function toAuthResult(response: AuthResponse) {
  return {
    accessToken: response.accessToken,
    currentUser: response.user,
    message: response.message,
  };
}

function toAuthFlowError(error: unknown) {
  if (error instanceof ApiError) {
    const message = error.message.toLowerCase();

    if (message.includes("expired")) {
      return new AuthFlowError(error.message, "expired_code");
    }

    if (message.includes("too many") || error.status === 429) {
      return new AuthFlowError(error.message, "too_many_attempts");
    }

    if (error.status === 400 || error.status === 401) {
      return new AuthFlowError(error.message, "invalid_code");
    }
  }

  return error;
}

export class AuthFlowError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_code" | "expired_code" | "too_many_attempts",
  ) {
    super(message);
    this.name = "AuthFlowError";
  }
}

export async function signInRequest(
  values: SignInValues,
): Promise<SignInResult> {
  const response = await requestJson<AuthResponse | TwoFactorChallengeResponse>(
    {
      path: "/api/auth/login",
      method: "POST",
      body: {
        email: values.email,
        password: values.password,
      },
    },
  );

  if (isTwoFactorChallenge(response)) {
    return {
      redirectTo: `/app/two-fa?method=${response.method}`,
      pendingTwoFactor: {
        method: response.method,
        twoFactorToken: response.twoFactorToken,
      },
    };
  }

  return {
    redirectTo: "/app",
    ...toAuthResult(response),
  };
}

export async function signUpRequest(
  values: SignUpValues,
): Promise<SignUpResult> {
  const normalizedEmail = values.email.trim().toLowerCase();

  const registration = await requestJson<MessageResponse>({
    path: "/api/auth/register",
    method: "POST",
    body: {
      email: normalizedEmail,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
      terms: values.terms,
    },
  });

  return {
    redirectTo: "/app/verify-code",
    verificationEmail: normalizedEmail,
    message: registration.message,
  };
}

export async function forgotPasswordRequest(
  values: ForgotPasswordValues,
): Promise<ForgotPasswordResult> {
  const normalizedEmail = values.email.trim().toLowerCase();
  const response = await requestJson<MessageResponse>({
    path: "/api/auth/forgot-password",
    method: "POST",
    body: {
      email: normalizedEmail,
    },
  });

  return {
    redirectTo: "/app/check-your-inbox",
    recoveryEmail: normalizedEmail,
    message: response.message,
  };
}

export async function verifyCodeRequest({
  email,
  code,
}: VerifyCodeValues & {
  email: string;
}): Promise<VerifyCodeResult> {
  const response = await requestJson<AuthResponse>({
    path: "/api/auth/register/verify",
    method: "POST",
    body: {
      email: email.trim().toLowerCase(),
      code,
    },
  }).catch((error: unknown) => {
    throw toAuthFlowError(error);
  });

  return {
    redirectTo: "/app",
    ...toAuthResult(response),
  };
}

export async function resendVerificationCodeRequest({
  email,
}: {
  email: string;
}): Promise<MessageResponse> {
  return requestJson<MessageResponse>({
    path: "/api/auth/register/resend-code",
    method: "POST",
    body: {
      email: email.trim().toLowerCase(),
    },
  });
}

export async function verifyForgotPasswordCodeRequest({
  email,
  code,
}: VerifyCodeValues & {
  email: string;
}): Promise<ForgotPasswordVerifyResult> {
  return requestJson<ForgotPasswordVerifyResult>({
    path: "/api/auth/forgot-password/verify",
    method: "POST",
    body: {
      email: email.trim().toLowerCase(),
      code,
    },
  }).catch((error: unknown) => {
    throw toAuthFlowError(error);
  });
}

export async function resendForgotPasswordCodeRequest({
  email,
}: {
  email: string;
}): Promise<MessageResponse> {
  return requestJson<MessageResponse>({
    path: "/api/auth/forgot-password",
    method: "POST",
    body: {
      email: email.trim().toLowerCase(),
    },
  });
}

export async function resetPasswordRequest({
  values,
  recoveryToken,
}: {
  values: ResetPasswordValues;
  recoveryToken: string;
}): Promise<ResetPasswordResult> {
  const response = await requestJson<MessageResponse>({
    path: "/api/auth/forgot-password/reset",
    method: "POST",
    body: {
      recoveryToken,
      password: values.password,
    },
  });

  return {
    redirectTo: "/app/password-changed",
    message: response.message,
  };
}

export async function changePasswordRequest({
  newPassword,
  accessToken,
}: {
  newPassword: string;
  accessToken: string;
}): Promise<ResetPasswordResult> {
  const response = await requestJson<MessageResponse>({
    path: "/api/auth/change-password",
    method: "POST",
    accessToken,
    body: {
      newPassword,
    },
  });

  return {
    redirectTo: "/app/password-changed",
    message: response.message,
  };
}

export async function verifyTwoFactorRequest({
  code,
  twoFactorToken,
}: VerifyCodeValues & {
  twoFactorToken?: string | null;
}): Promise<VerifyTwoFactorResult> {
  const response = await requestJson<AuthResponse>({
    path: "/api/auth/2fa/verify",
    method: "POST",
    body: twoFactorToken ? { code, twoFactorToken } : { code },
  }).catch((error: unknown) => {
    throw toAuthFlowError(error);
  });

  return {
    redirectTo: "/app",
    ...toAuthResult(response),
  };
}

export async function resendTwoFactorCodeRequest({
  twoFactorToken,
}: {
  twoFactorToken?: string | null;
}): Promise<TwoFactorChallengeResponse> {
  return requestJson<TwoFactorChallengeResponse>({
    path: "/api/auth/2fa/resend",
    method: "POST",
    body: twoFactorToken ? { twoFactorToken } : {},
  });
}

export async function refreshSessionRequest(): Promise<RefreshSessionResult> {
  const response = await requestJson<AuthResponse>({
    path: "/api/auth/refresh",
    method: "POST",
  });

  return toAuthResult(response);
}

export async function logoutRequest(accessToken: string) {
  return requestJson<MessageResponse>({
    path: "/api/auth/logout",
    method: "POST",
    accessToken,
  });
}

export async function logoutAllSessionsRequest(accessToken: string) {
  return requestJson<MessageResponse>({
    path: "/api/auth/logout/all",
    method: "POST",
    accessToken,
  });
}

export async function getAuthSessionsRequest(accessToken: string) {
  return requestJson<AuthSession[]>({
    path: "/api/auth/sessions",
    method: "GET",
    accessToken,
  });
}

export async function deleteAuthSessionRequest({
  accessToken,
  sessionId,
}: {
  accessToken: string;
  sessionId: string;
}) {
  return requestJson<MessageResponse>({
    path: `/api/auth/sessions/${sessionId}`,
    method: "DELETE",
    accessToken,
  });
}

export async function deleteAccountRequest(accessToken: string) {
  return requestJson<MessageResponse>({
    path: "/api/users/me/account",
    method: "DELETE",
    accessToken,
  });
}

export async function getTwoFactorSettingsRequest(accessToken: string) {
  return requestJson<TwoFactorSettingsResponse>({
    path: "/api/auth/2fa/settings",
    method: "GET",
    accessToken,
  });
}

export async function updateTwoFactorMethodRequest({
  accessToken,
  method,
}: {
  accessToken: string;
  method: TwoFactorMethod;
}) {
  return requestJson<TwoFactorSettingsResponse>({
    path: "/api/auth/2fa/method",
    method: "PATCH",
    accessToken,
    body: {
      method,
    },
  });
}

export async function startTotpSetupRequest({
  accessToken,
}: {
  accessToken: string;
}): Promise<TotpSetupResult & { setupKey: string }> {
  const response = await requestJson<TotpSetupResult>({
    path: "/api/auth/2fa/totp/setup",
    method: "POST",
    accessToken,
  });

  return {
    ...response,
    setupKey: response.secret,
  };
}

export async function verifyTotpSetupRequest({
  accessToken,
  code,
}: {
  accessToken: string;
  code: string;
}): Promise<TotpSetupVerificationResult> {
  const response = await requestJson<MessageResponse>({
    path: "/api/auth/2fa/totp/verify-setup",
    method: "POST",
    accessToken,
    body: {
      code,
    },
  }).catch((error: unknown) => {
    throw toAuthFlowError(error);
  });

  return {
    redirectTo: "/app/settings/security",
    message: response.message,
  };
}

export function getGoogleAuthHref() {
  return `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? ""}/api/auth/google`;
}
