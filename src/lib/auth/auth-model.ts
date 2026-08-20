export type TwoFactorMethod = "email" | "totp";

export type UserRole = "member" | "admin";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
};

export type PendingVerificationState = "code_sent" | "verified";

export type PendingVerification = {
  email: string;
  state: PendingVerificationState;
  sentAt: string;
};

export type PendingTwoFactorChallenge = {
  method: TwoFactorMethod;
  twoFactorToken: string | null;
  redirectTo: string;
  issuedAt: string;
};

export type AuthSession = {
  id: string;
  device: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
  isActive: boolean;
};

export const demoAuthUser: AuthUser = {
  id: "user-demo-mvobolis",
  firstName: "Mykhailo",
  lastName: "Vobolis",
  email: "mvobolis@gmail.com",
  role: "admin",
  avatarUrl: null,
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
