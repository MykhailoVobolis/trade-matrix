export type TwoFactorMethod = "email" | "totp";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  workspaceName: string;
  roleLabel: string;
};

export type PendingVerificationState = "code_sent" | "verified";

export type PendingVerification = {
  email: string;
  state: PendingVerificationState;
  sentAt: string;
};

export type PendingTwoFactorChallenge = {
  email: string;
  method: TwoFactorMethod;
  redirectTo: string;
  issuedAt: string;
};

export const demoAuthUser: AuthUser = {
  id: "user-demo-mvobolis",
  firstName: "Mykhailo",
  lastName: "Vobolis",
  email: "mvobolis@gmail.com",
  avatarUrl: null,
  workspaceName: "TradeMatrix",
  roleLabel: "Admin",
};

export function createMockAuthUser(
  values: Partial<Pick<AuthUser, "firstName" | "lastName" | "email">>,
): AuthUser {
  const firstName = values.firstName?.trim() || demoAuthUser.firstName;
  const lastName = values.lastName?.trim() || demoAuthUser.lastName;
  const email = values.email?.trim().toLowerCase() || demoAuthUser.email;

  return {
    ...demoAuthUser,
    id: `user-${email.replace(/[^a-z0-9]/g, "-")}`,
    firstName,
    lastName,
    email,
  };
}

export function getAuthUserInitials(user: AuthUser | null) {
  if (!user) {
    return "TM";
  }

  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}
