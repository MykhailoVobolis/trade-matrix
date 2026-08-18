"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3Icon,
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingCartIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
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

const navigationItems = [
  {
    title: "Dashboard",
    href: "/app",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Sales",
    href: "/app/sales",
    icon: BarChart3Icon,
  },
  {
    title: "Purchases",
    href: "/app/purchases",
    icon: ShoppingCartIcon,
  },
  {
    title: "Products",
    href: "/app/products",
    icon: PackageIcon,
  },
  {
    title: "Counterparties",
    href: "/app/counterparties",
    icon: UsersIcon,
  },
  {
    title: "Analytics",
    href: "/app/analytics",
    icon: BarChart3Icon,
  },
  {
    title: "Uploads",
    href: "/app/uploads",
    icon: UploadIcon,
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

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-3 overflow-hidden p-3 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/app"
            className="flex min-w-0 items-center gap-3 overflow-hidden rounded-md px-2 py-1.5 text-sidebar-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-0"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <LayoutDashboardIcon className="size-4" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">TradeMatrix</p>
              <p className="truncate text-xs text-muted-foreground">
                Private workspace
              </p>
            </div>
          </Link>

          <SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-3 group-data-[collapsible=icon]:px-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
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

      <SidebarFooter className="overflow-hidden p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
                    tooltip="Demo User"
                  />
                }
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                  MV
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">Demo User</span>
                  <span className="truncate text-xs text-muted-foreground">
                    demo@tradematrix.app
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
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                        MV
                      </div>
                      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">Demo User</span>
                        <span className="truncate text-xs text-muted-foreground">
                          demo@tradematrix.app
                        </span>
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
