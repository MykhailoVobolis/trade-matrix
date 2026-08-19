"use client";

import Link from "next/link";
import {
  ArrowLeftIcon,
  LaptopIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { demoAuthUser } from "@/lib/auth/auth-model";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { useAuthTwoFactorStore } from "@/lib/auth/auth-two-factor-store";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "security";

const activeSessions = [
  {
    id: "session-macos-current",
    device: "Macintosh (macOS)",
    location: "Dnipro",
    created: "Aug 19, 2026, 12:54 PM",
    updated: "Aug 19, 2026, 12:54 PM",
    status: "Active",
  },
] as const;

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
  const preferredMethod = useAuthTwoFactorStore(
    (state) => state.preferredMethod,
  );
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionPendingDeletion, setSessionPendingDeletion] = useState<
    (typeof activeSessions)[number] | null
  >(null);
  const twoFactorOptions = [
    {
      value: "email",
      title: "Two-Factor Authentication (2FA) - Email",
      description:
        "A security code will be sent to your email address for Two-Factor Authentication (2FA) when you sign in. You will need to check the email address associated with this account for this code in order to sign in.",
      checked: preferredMethod === "email",
    },
    {
      value: "authenticator",
      title: "Two-Factor Authentication (2FA) - Authenticator",
      description:
        "Configure your Authenticator App to generate time-sensitive codes for signing into TradeMatrix. You will need to install an Authenticator app from your mobile device app store to generate codes.",
      checked: preferredMethod === "totp",
      href: "/app/setup-2fa",
    },
  ] as const;

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
                Update your password using the recovery flow and confirm the new
                credentials before the next sign-in.
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="px-6"
              onClick={() => setIsResetDialogOpen(true)}
            >
              Reset password
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

            <div className="mt-6 space-y-5">
              {twoFactorOptions.map((option) => {
                return (
                  <div
                    key={option.value}
                    className="flex items-start gap-4 rounded-2xl border border-border/70 px-5 py-5"
                  >
                    {option.href ? (
                      <Link
                        href={option.href}
                        className="mt-0.5"
                        aria-label={`Select ${option.title}`}
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
                      <div
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
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
                    )}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium tracking-tight">
                          {option.title}
                        </p>
                        {option.value === "email" ? (
                          <span className="rounded-full bg-sidebar-primary/10 px-2.5 py-0.5 text-xs font-medium text-sidebar-primary">
                            Active
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
                  {activeSessions.map((session) => (
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
                              <span className="rounded-full bg-sidebar-primary/10 px-2.5 py-0.5 text-xs font-medium text-sidebar-primary">
                                {session.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-muted-foreground">
                        {session.location}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-muted-foreground">
                        {session.created}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-muted-foreground">
                        {session.updated}
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
                              className="text-destructive hover:text-destructive focus:text-destructive"
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
                End all active sessions except the current workspace session.
              </p>
            </div>
            <Button variant="outline" size="lg" className="px-6">
              Log out
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
              Reset password
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              You will be redirected to the password reset page. Continue?
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
          <DialogFooter className="mt-3 border-t-0 bg-transparent p-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <Button
              variant="outline"
              size="lg"
              className="px-5"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="px-5"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Delete
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
                ? `This will remove the ${sessionPendingDeletion.device} session from the active sessions list. This action will later call the session deletion endpoint.`
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
              onClick={() => setSessionPendingDeletion(null)}
            >
              Delete
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
