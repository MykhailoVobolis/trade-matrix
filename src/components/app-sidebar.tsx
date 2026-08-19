"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Building2Icon,
  ChevronsUpDownIcon,
  CloudUploadIcon,
  HouseIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PackageIcon,
  SunIcon,
  SettingsIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { demoAuthUser, getAuthUserInitials } from "@/lib/auth/auth-model";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { useAuthRecoveryStore } from "@/lib/auth/auth-recovery-store";
import { useAuthTwoFactorStore } from "@/lib/auth/auth-two-factor-store";

const navigationItems = [
  {
    title: "Overview",
    href: "/app",
    icon: HouseIcon,
  },
  {
    title: "Upload Tables",
    href: "/app/uploads",
    icon: CloudUploadIcon,
  },
  {
    title: "Suppliers",
    href: "/app/suppliers",
    icon: Building2Icon,
  },
  {
    title: "Buyers",
    href: "/app/buyers",
    icon: UsersIcon,
  },
  {
    title: "Products",
    href: "/app/products",
    icon: PackageIcon,
  },
  {
    title: "UKTZED",
    href: "/app/uktzed",
    icon: TagIcon,
  },
] as const;

const themeOptions = [
  {
    label: "Light",
    value: "light",
    icon: SunIcon,
  },
  {
    label: "System",
    value: "system",
    icon: MonitorIcon,
  },
  {
    label: "Dark",
    value: "dark",
    icon: MoonIcon,
  },
] as const;

function isItemActive(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const currentUser = useAuthSessionStore((state) => state.currentUser);
  const signOut = useAuthSessionStore((state) => state.signOut);
  const clearRecovery = useAuthRecoveryStore((state) => state.clearRecovery);
  const clearChallenge = useAuthTwoFactorStore((state) => state.clearChallenge);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const effectiveTheme = mounted ? resolvedTheme : "light";
  const selectedTheme = mounted ? (theme ?? "system") : "system";
  const user = currentUser ?? demoAuthUser;
  const userInitials = getAuthUserInitials(user);

  function handleLogout() {
    signOut();
    clearRecovery();
    clearChallenge();
    router.replace("/app/sign-in");
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/app" />}
              tooltip="TradeMatrix"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <LayoutDashboardIcon className="size-4" />
              </div>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">TradeMatrix</span>
                <span className="truncate text-xs text-muted-foreground">
                  Private workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-3 group-data-[collapsible=icon]:px-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href} className="py-0.5">
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isItemActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton size="lg" tooltip="Demo User" />}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  {userInitials}
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">
                    {`${user.firstName} ${user.lastName}`}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 rounded-xl"
                side="top"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                        {userInitials}
                      </div>
                      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {`${user.firstName} ${user.lastName}`}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/app/settings/general" />}
                >
                  <SettingsIcon />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="justify-between"
                    onSelect={(event) => event.preventDefault()}
                  >
                    <div className="flex items-center gap-1.5">
                      <MoonIcon />
                      <span>Appearance</span>
                    </div>
                    <Switch
                      checked={effectiveTheme === "dark"}
                      aria-label="Toggle dark mode"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onCheckedChange={(checked) =>
                        setTheme(checked ? "dark" : "light")
                      }
                    />
                  </DropdownMenuItem>
                  <div className="px-1 pb-1">
                    <DropdownMenuRadioGroup
                      value={selectedTheme}
                      onValueChange={(value) => setTheme(value)}
                    >
                      <div className="grid grid-cols-3 gap-1">
                        {themeOptions.map((option) => {
                          const Icon = option.icon;

                          return (
                            <DropdownMenuRadioItem
                              key={option.value}
                              value={option.value}
                              className="justify-center rounded-md px-2 py-1.5"
                            >
                              <Icon className="size-3.5" />
                              <span className="sr-only">{option.label}</span>
                            </DropdownMenuRadioItem>
                          );
                        })}
                      </div>
                    </DropdownMenuRadioGroup>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarTrigger className="absolute top-3 right-3 shrink-0 group-data-[collapsible=icon]:hidden md:flex" />

      <SidebarRail />
    </Sidebar>
  );
}
