import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh">
        <div className="relative flex min-h-svh flex-1 flex-col">
          <SidebarTrigger className="absolute top-3 left-3 z-20 md:hidden" />
          <div className="flex flex-1 flex-col p-6 pt-16 md:p-8">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
