"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Building2Icon,
  ChevronsUpDownIcon,
  DatabaseIcon,
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
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { logoutRequest } from "@/lib/auth/auth-api";
import { demoAuthUser, getAuthUserInitials } from "@/lib/auth/auth-model";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { useAuthRecoveryStore } from "@/lib/auth/auth-recovery-store";
import { useAuthTwoFactorStore } from "@/lib/auth/auth-two-factor-store";

const navigationItems = [
  {
    title: "Огляд",
    href: "/app",
    icon: HouseIcon,
  },
  {
    title: "Постачальники",
    href: "/app/suppliers",
    icon: Building2Icon,
  },
  {
    title: "Покупці",
    href: "/app/buyers",
    icon: UsersIcon,
  },
  {
    title: "Продукти",
    href: "/app/products",
    icon: PackageIcon,
  },
  {
    title: "Таблиці",
    href: "/app/tables",
    icon: DatabaseIcon,
  },
  {
    title: "УКТЗЕД",
    href: "/app/uktzed",
    icon: TagIcon,
  },
] as const;

const themeOptions = [
  {
    label: "Світла",
    value: "light",
    icon: SunIcon,
  },
  {
    label: "Системна",
    value: "system",
    icon: MonitorIcon,
  },
  {
    label: "Темна",
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
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const currentUser = useAuthSessionStore((state) => state.currentUser);
  const signOut = useAuthSessionStore((state) => state.signOut);
  const clearRecovery = useAuthRecoveryStore((state) => state.clearRecovery);
  const clearChallenge = useAuthTwoFactorStore((state) => state.clearChallenge);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [isUktzedComingSoonOpen, setIsUktzedComingSoonOpen] = useState(false);

  const effectiveTheme = mounted ? resolvedTheme : "light";
  const selectedTheme = mounted ? (theme ?? "system") : "system";
  const user = currentUser ?? demoAuthUser;
  const userInitials = getAuthUserInitials(user);

  async function handleLogout() {
    if (accessToken) {
      try {
        await logoutRequest(accessToken);
      } catch {
        // Local sign-out should still proceed if the backend session is already gone.
      }
    }

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
                const isUktzedItem = item.href === "/app/uktzed";
                const menuButtonContent = (
                  <>
                    <Icon />
                    <span>{item.title}</span>
                  </>
                );

                return (
                  <SidebarMenuItem key={item.href} className="py-0.5">
                    {isUktzedItem ? (
                      <Popover
                        modal={false}
                        open={isUktzedComingSoonOpen}
                        onOpenChange={setIsUktzedComingSoonOpen}
                      >
                        <PopoverTrigger
                          render={
                            <SidebarMenuButton
                              isActive={isItemActive(pathname, item.href)}
                              tooltip={item.title}
                            />
                          }
                        >
                          {menuButtonContent}
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="bottom"
                          sideOffset={8}
                          className="w-64 rounded-md px-3 py-3 shadow-[0_20px_48px_-24px_rgba(15,23,42,0.28)]"
                        >
                          <PopoverHeader className="gap-2">
                            <PopoverTitle className="text-base font-normal tracking-[-0.02em] text-foreground">
                              Незабаром
                            </PopoverTitle>
                            <PopoverDescription className="leading-6 text-muted-foreground text-sm">
                              Ми завершуємо останні приготування. Завітайте
                              пізніше.
                            </PopoverDescription>
                          </PopoverHeader>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isItemActive(pathname, item.href)}
                        tooltip={item.title}
                      >
                        {menuButtonContent}
                      </SidebarMenuButton>
                    )}
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
                render={
                  <SidebarMenuButton
                    size="lg"
                    tooltip={`${user.firstName} ${user.lastName}`}
                  />
                }
              >
                <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{`${user.firstName} ${user.lastName}`}</span>
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
                      <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          userInitials
                        )}
                      </div>
                      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{`${user.firstName} ${user.lastName}`}</span>
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
                  Налаштування
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="justify-between"
                    onSelect={(event) => event.preventDefault()}
                  >
                    <div className="flex items-center gap-1.5">
                      <MoonIcon />
                      <span>Тема</span>
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
                  Вийти
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
