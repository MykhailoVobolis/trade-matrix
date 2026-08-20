"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CameraIcon, LoaderCircleIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";

import { AuthFieldError } from "@/components/auth/auth-field-error";
import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { ThemePreferenceRow } from "@/components/settings/theme-preference-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { updateGeneralSettingsRequest } from "@/lib/settings/settings-api";
import {
  generalSettingsSchema,
  type GeneralSettingsValues,
} from "@/lib/settings/settings-schemas";

type GeneralSettingsFormProps = {
  defaultValues: GeneralSettingsValues;
};

export function GeneralSettingsForm({
  defaultValues,
}: GeneralSettingsFormProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const currentUser = useAuthSessionStore((state) => state.currentUser);
  const updateCurrentUser = useAuthSessionStore(
    (state) => state.updateCurrentUser,
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const updateMutation = useMutation({
    mutationFn: updateGeneralSettingsRequest,
    onSuccess: ({ profile }) => {
      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });
      setAvatarFile(null);
      setAvatarError(null);
      updateCurrentUser({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
      });
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    updateMutation.reset();
    return updateMutation.mutateAsync({
      values,
      avatarFile,
      accessToken: accessToken ?? "",
    });
  });

  function handleAvatarPickerOpen() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Select a valid image file.");
      event.target.value = "";
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);

    setAvatarPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });
  }

  const isDirty = form.formState.isDirty || Boolean(avatarFile);

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      {updateMutation.error ? (
        <AuthInlineMessage variant="error" title="Save failed">
          {updateMutation.error.message}
        </AuthInlineMessage>
      ) : null}

      {updateMutation.isSuccess ? (
        <AuthInlineMessage variant="success" title="Changes saved">
          Your profile details were updated successfully.
        </AuthInlineMessage>
      ) : null}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">
          Profile information
        </h3>

        <div className="flex items-end gap-4">
          <div className="relative">
            <div className="relative flex size-26 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-5xl font-medium text-sidebar-primary-foreground">
              {avatarPreviewUrl ? (
                <Image
                  src={avatarPreviewUrl}
                  alt="Profile avatar preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : currentUser?.avatarUrl ? (
                <Image
                  src={currentUser.avatarUrl}
                  alt="Profile avatar"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span>M</span>
              )}
            </div>
            <button
              type="button"
              className="absolute right-1 bottom-1 flex size-8 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              aria-label="Change profile image"
              onClick={handleAvatarPickerOpen}
            >
              <CameraIcon className="size-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
        <AuthFieldError>{avatarError}</AuthFieldError>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-first-name">First name</Label>
          <Input
            {...form.register("firstName")}
            id="settings-first-name"
            className="h-12 rounded-xl text-base"
            aria-invalid={Boolean(form.formState.errors.firstName)}
            disabled={updateMutation.isPending}
          />
          <AuthFieldError>
            {form.formState.errors.firstName?.message}
          </AuthFieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-last-name">Last name</Label>
          <Input
            {...form.register("lastName")}
            id="settings-last-name"
            className="h-12 rounded-xl text-base"
            aria-invalid={Boolean(form.formState.errors.lastName)}
            disabled={updateMutation.isPending}
          />
          <AuthFieldError>
            {form.formState.errors.lastName?.message}
          </AuthFieldError>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="settings-email-address">Email address</Label>
          <Input
            {...form.register("email")}
            id="settings-email-address"
            readOnly
            className="h-12 rounded-xl text-base"
            disabled
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Preferences</h3>
        <ThemePreferenceRow
          checked={mounted ? resolvedTheme === "dark" : false}
          disabled={updateMutation.isPending}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          className="px-6"
          disabled={updateMutation.isPending || !isDirty}
        >
          {updateMutation.isPending ? (
            <>
              <LoaderCircleIcon className="animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}
