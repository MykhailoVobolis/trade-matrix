import type { GeneralSettingsValues } from "@/lib/settings/settings-schemas";

type UpdateGeneralSettingsResult = {
  profile: GeneralSettingsValues;
  avatarFileName: string | null;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function updateGeneralSettingsRequest({
  values,
  avatarFile,
}: {
  values: GeneralSettingsValues;
  avatarFile?: File | null;
}): Promise<UpdateGeneralSettingsResult> {
  await wait(900);

  if (values.firstName.toLowerCase() === "error") {
    throw new Error("We couldn't save your profile changes. Try again.");
  }

  return {
    profile: {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
    },
    avatarFileName: avatarFile?.name ?? null,
  };
}
