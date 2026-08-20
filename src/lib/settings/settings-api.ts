import type { GeneralSettingsValues } from "@/lib/settings/settings-schemas";
import { requestJson } from "@/lib/api/http-client";
import type { AuthUser } from "@/lib/auth/auth-model";

type UpdateGeneralSettingsResult = {
  profile: Pick<AuthUser, "firstName" | "lastName" | "email" | "avatarUrl">;
};

export async function updateGeneralSettingsRequest({
  values,
  avatarFile,
  accessToken,
}: {
  values: GeneralSettingsValues;
  avatarFile?: File | null;
  accessToken: string;
}): Promise<UpdateGeneralSettingsResult> {
  const formData = new FormData();

  if (values.firstName.trim()) {
    formData.append("firstName", values.firstName.trim());
  }

  if (values.lastName.trim()) {
    formData.append("lastName", values.lastName.trim());
  }

  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }

  const profile = await requestJson<AuthUser>({
    path: "/api/users/me/profile",
    method: "PATCH",
    body: formData,
    accessToken,
  });

  return {
    profile: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
    },
  };
}
