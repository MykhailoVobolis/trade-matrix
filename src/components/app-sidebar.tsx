"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const effectiveTheme = mounted ? resolvedTheme : "light";
  const selectedTheme = mounted ? (theme ?? "system") : "system";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-3 overflow-hidden p-3 group-data-[collapsible=icon]:p-2">
        <div className="flex min-h-10 items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/app"
            className="flex h-10 min-w-0 items-center gap-3 overflow-hidden rounded-md px-2 py-1.5 text-sidebar-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:p-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <LayoutDashboardIcon className="size-4" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">TradeMatrix</p>
              <p className="truncate text-xs text-muted-foreground">Private workspace</p>
            </div>
          </Link>

          <SidebarTrigger className="ml-auto shrink-0 group-data-[collapsible=icon]:hidden" />
        </div>
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
                      tooltip={item.title}>
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

      <SidebarFooter className="overflow-hidden p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="h-10 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0"
                    tooltip="Demo User"
                  />
                }>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  MV
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">Demo User</span>
                  <span className="truncate text-xs text-muted-foreground">demo@tradematrix.app</span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 rounded-xl" side="top" align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                        MV
                      </div>
                      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">Demo User</span>
                        <span className="truncate text-xs text-muted-foreground">demo@tradematrix.app</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/app/settings" />}>
                  <SettingsIcon />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="justify-between" onSelect={(event) => event.preventDefault()}>
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
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    />
                  </DropdownMenuItem>
                  <div className="px-1 pb-1">
                    <DropdownMenuRadioGroup value={selectedTheme} onValueChange={(value) => setTheme(value)}>
                      <div className="grid grid-cols-3 gap-1">
                        {themeOptions.map((option) => {
                          const Icon = option.icon;

                          return (
                            <DropdownMenuRadioItem
                              key={option.value}
                              value={option.value}
                              className="justify-center rounded-md px-2 py-1.5">
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
                <DropdownMenuItem>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
