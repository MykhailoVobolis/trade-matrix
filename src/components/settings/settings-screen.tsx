"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  LaptopIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";

import { AuthInlineMessage } from "@/components/auth/auth-inline-message";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteAccountRequest,
  deleteAuthSessionRequest,
  getAuthSessionsRequest,
  getTwoFactorSettingsRequest,
  logoutAllSessionsRequest,
  updateTwoFactorMethodRequest,
} from "@/lib/auth/auth-api";
import { demoAuthUser, type AuthSession } from "@/lib/auth/auth-model";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { useAuthTwoFactorStore } from "@/lib/auth/auth-two-factor-store";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "security";

function formatSessionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, "MMM d, yyyy, h:mm a");
}

function SettingsTabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative pb-3 text-base transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-sidebar-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}

function GeneralSettingsPanel() {
  const currentUser = useAuthSessionStore((state) => state.currentUser);
  const user = currentUser ?? demoAuthUser;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">General</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Manage your personal information and workspace appearance.
        </p>
      </div>

      <GeneralSettingsForm
        defaultValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }}
      />
    </div>
  );
}

function SecuritySettingsPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const signOut = useAuthSessionStore((state) => state.signOut);
  const setPreferredMethod = useAuthTwoFactorStore(
    (state) => state.setPreferredMethod,
  );
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionPendingDeletion, setSessionPendingDeletion] =
    useState<AuthSession | null>(null);

  const twoFactorSettingsQuery = useQuery({
    queryKey: ["two-factor-settings", accessToken],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getTwoFactorSettingsRequest(accessToken);
    },
    enabled: Boolean(accessToken),
  });

  const sessionsQuery = useQuery({
    queryKey: ["auth-sessions", accessToken],
    queryFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return getAuthSessionsRequest(accessToken);
    },
    enabled: Boolean(accessToken),
  });

  const updateTwoFactorMutation = useMutation({
    mutationFn: (method: "email" | "totp") => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return updateTwoFactorMethodRequest({
        accessToken,
        method,
      });
    },
    onSuccess: (response) => {
      setPreferredMethod(response.method);
      void queryClient.invalidateQueries({
        queryKey: ["two-factor-settings", accessToken],
      });
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return logoutAllSessionsRequest(accessToken);
    },
    onSuccess: () => {
      signOut();
      router.replace("/app/sign-in");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return deleteAccountRequest(accessToken);
    },
    onSuccess: () => {
      signOut();
      setIsDeleteDialogOpen(false);
      router.replace("/app/sign-in");
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => {
      if (!accessToken) {
        throw new Error("Authentication required.");
      }

      return deleteAuthSessionRequest({
        accessToken,
        sessionId,
      });
    },
    onSuccess: () => {
      if (sessionPendingDeletion?.isCurrent) {
        signOut();
        setSessionPendingDeletion(null);
        router.replace("/app/sign-in");
        return;
      }

      setSessionPendingDeletion(null);
      void queryClient.invalidateQueries({
        queryKey: ["auth-sessions", accessToken],
      });
    },
  });

  const currentMethod = twoFactorSettingsQuery.data?.method ?? "email";
  const isTotpEnabled = twoFactorSettingsQuery.data?.isTotpEnabled ?? false;
  const twoFactorOptions = [
    {
      value: "email" as const,
      title: "Two-Factor Authentication (2FA) - Email",
      description:
        "A security code will be sent to your email address for Two-Factor Authentication (2FA) when you sign in. You will need to check the email address associated with this account for this code in order to sign in.",
      checked: currentMethod === "email",
    },
    {
      value: "totp" as const,
      title: "Two-Factor Authentication (2FA) - Authenticator",
      description:
        "Configure your Authenticator App to generate time-sensitive codes for signing into TradeMatrix. You will need to install an Authenticator app from your mobile device app store to generate codes.",
      checked: currentMethod === "totp",
    },
  ];

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Security</h2>
          <p className="max-w-4xl text-sm text-muted-foreground">
            Security settings help protect your account, including password
            management, two-factor authentication, and active session control.
          </p>
        </div>

        <div className="space-y-0 divide-y divide-border/70 rounded-[1.75rem] border border-border/70 bg-card">
          <div className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold tracking-tight">Password</h3>
              <p className="text-sm text-muted-foreground">
                Update the password for the current authenticated account.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="px-6"
              onClick={() => setIsResetDialogOpen(true)}
            >
              Change password
            </Button>
          </div>

          <div className="px-6 py-8">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight">
                Two-factor authentication
              </h3>
              <p className="max-w-4xl text-sm text-muted-foreground">
                Choose the verification method used after sign-in. Authenticator
                setup is managed as a separate security flow.
              </p>
            </div>

            {twoFactorSettingsQuery.isError ? (
              <AuthInlineMessage
                variant="error"
                title="2FA settings unavailable"
                className="mt-6"
              >
                {twoFactorSettingsQuery.error.message}
              </AuthInlineMessage>
            ) : null}

            <div className="mt-6 space-y-5">
              {twoFactorOptions.map((option) => {
                const isPending =
                  updateTwoFactorMutation.isPending &&
                  updateTwoFactorMutation.variables === option.value;

                return (
                  <div
                    key={option.value}
                    className="flex items-start gap-4 rounded-2xl border border-border/70 px-5 py-5"
                  >
                    {option.value === "totp" && !isTotpEnabled ? (
                      <Link
                        href="/app/setup-2fa"
                        className="mt-0.5"
                        aria-label={`Set up ${option.title}`}
                      >
                        <div
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors hover:border-sidebar-primary",
                            option.checked
                              ? "border-sidebar-primary"
                              : "border-border/80",
                          )}
                        >
                          <span
                            className={cn(
                              "size-2 rounded-full transition-colors",
                              option.checked
                                ? "bg-sidebar-primary"
                                : "bg-transparent",
                            )}
                          />
                        </div>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                          option.checked
                            ? "border-sidebar-primary"
                            : "border-border/80",
                        )}
                        aria-label={`Select ${option.title}`}
                        disabled={updateTwoFactorMutation.isPending}
                        onClick={() =>
                          updateTwoFactorMutation.mutate(option.value)
                        }
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full transition-colors",
                            option.checked
                              ? "bg-sidebar-primary"
                              : "bg-transparent",
                          )}
                        />
                      </button>
                    )}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium tracking-tight">
                          {option.title}
                        </p>
                        {option.checked ? (
                          <span className="rounded-full bg-sidebar-primary/10 px-2.5 py-0.5 text-xs font-medium text-sidebar-primary">
                            Active
                          </span>
                        ) : null}
                        {isPending ? (
                          <span className="text-xs text-muted-foreground">
                            Updating...
                          </span>
                        ) : null}
                      </div>
                      <p className="max-w-4xl text-sm leading-7 text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-8">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight">
                Active sessions
              </h3>
              <p className="text-sm text-muted-foreground">
                Review currently signed-in devices and recent session activity.
              </p>
            </div>

            {sessionsQuery.isError ? (
              <AuthInlineMessage
                variant="error"
                title="Sessions unavailable"
                className="mt-6"
              >
                {sessionsQuery.error.message}
              </AuthInlineMessage>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-2xl border border-border/80">
              <Table>
                <TableHeader className="bg-muted/35">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-14 px-6 text-sm">Device</TableHead>
                    <TableHead className="px-6 text-sm">Location</TableHead>
                    <TableHead className="px-6 text-sm">Created</TableHead>
                    <TableHead className="px-6 text-sm">Updated</TableHead>
                    <TableHead className="w-14 px-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(sessionsQuery.data ?? []).map((session) => (
                    <TableRow key={session.id} className="hover:bg-transparent">
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-sidebar-primary/10 text-sidebar-primary">
                            <LaptopIcon className="size-4" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {session.device}
                              </span>
                              {session.isActive ? (
                                <span className="rounded-full bg-sidebar-primary/10 px-2.5 py-0.5 text-xs font-medium text-sidebar-primary">
                                  Active
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-muted-foreground">
                        {session.location?.trim() || "Unknown"}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-muted-foreground">
                        {formatSessionDate(session.createdAt)}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-muted-foreground">
                        {formatSessionDate(session.updatedAt)}
                      </TableCell>
                      <TableCell className="px-4 py-5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground"
                                aria-label="Open session actions"
                              />
                            }
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="min-w-36 rounded-xl"
                          >
                            <DropdownMenuItem
                              variant="destructive"
                              className="data-[highlighted]:text-destructive data-[highlighted]:*:[svg]:text-destructive hover:*:[svg]:text-destructive focus:*:[svg]:text-destructive"
                              onClick={() => setSessionPendingDeletion(session)}
                            >
                              <Trash2Icon className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!sessionsQuery.isPending &&
                  (sessionsQuery.data?.length ?? 0) === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-muted-foreground"
                      >
                        No active sessions were returned by the backend.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold tracking-tight">
                Log out of all devices
              </h3>
              <p className="text-sm text-muted-foreground">
                End all active sessions and require a fresh sign-in.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="px-6"
              disabled={logoutAllMutation.isPending}
              onClick={() => logoutAllMutation.mutate()}
            >
              {logoutAllMutation.isPending ? "Logging out..." : "Log out"}
            </Button>
          </div>

          <div className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold tracking-tight">
                Delete account
              </h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="border-destructive/30 px-6 text-destructive hover:bg-destructive/8 hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2Icon className="size-4" />
              Delete account
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-[1.75rem] p-8"
        >
          <DialogHeader className="gap-3">
            <DialogTitle className="text-3xl font-semibold tracking-tight">
              Change password
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              You will be redirected to the password change page. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3 border-t-0 bg-transparent p-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <Button
              variant="outline"
              size="lg"
              className="px-5"
              onClick={() => setIsResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="px-5"
              onClick={() => {
                setIsResetDialogOpen(false);
                router.push("/app/change-password");
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-[1.75rem] p-8"
        >
          <DialogHeader className="gap-3">
            <DialogTitle className="text-3xl font-semibold tracking-tight">
              Delete account
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteAccountMutation.error ? (
            <AuthInlineMessage variant="error" title="Delete failed">
              {deleteAccountMutation.error.message}
            </AuthInlineMessage>
          ) : null}
          <DialogFooter className="mt-3 border-t-0 bg-transparent p-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <Button
              variant="outline"
              size="lg"
              className="px-5"
              onClick={() => {
                deleteAccountMutation.reset();
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="px-5"
              disabled={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(sessionPendingDeletion)}
        onOpenChange={(open) => {
          if (!open) {
            setSessionPendingDeletion(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-[1.75rem] p-8"
        >
          <DialogHeader className="gap-3">
            <DialogTitle className="text-3xl font-semibold tracking-tight">
              Delete session
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {sessionPendingDeletion
                ? `This will remove the ${sessionPendingDeletion.device} session from the active sessions list.`
                : "This will remove the selected session from the active sessions list."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3 border-t-0 bg-transparent p-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <Button
              variant="outline"
              size="lg"
              className="px-5"
              onClick={() => setSessionPendingDeletion(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="px-5"
              disabled={deleteSessionMutation.isPending}
              onClick={() => {
                if (!sessionPendingDeletion) {
                  return;
                }

                deleteSessionMutation.mutate(sessionPendingDeletion.id);
              }}
            >
              {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SettingsScreen({ currentTab }: { currentTab: SettingsTab }) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 md:px-8 md:py-8">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Back to overview"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
        </div>

        <div className="flex items-center gap-6 border-b border-border/70">
          <SettingsTabLink
            href="/app/settings/general"
            active={currentTab === "general"}
          >
            General
          </SettingsTabLink>
          <SettingsTabLink
            href="/app/settings/security"
            active={currentTab === "security"}
          >
            Security
          </SettingsTabLink>
        </div>
      </div>

      {currentTab === "security" ? (
        <SecuritySettingsPanel />
      ) : (
        <GeneralSettingsPanel />
      )}
    </section>
  );
}
