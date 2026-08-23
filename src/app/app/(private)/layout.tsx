import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { PrivateRouteGuard } from "@/components/auth/private-route-guard";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type PrivateAppLayoutProps = {
  children: ReactNode;
};

export default function PrivateAppLayout({ children }: PrivateAppLayoutProps) {
  return (
    <PrivateRouteGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-svh min-w-0 overflow-hidden">
          <div className="relative flex min-h-svh min-w-0 flex-1 flex-col overflow-hidden">
            <SidebarTrigger className="absolute top-3 left-3 z-20 md:hidden" />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden p-6 pt-16 md:p-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </PrivateRouteGuard>
  );
}
