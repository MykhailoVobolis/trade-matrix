import type { ReactNode } from "react";

import { AuthBrand } from "@/components/auth/auth-brand";
import { AuthScreenHeader } from "@/components/auth/auth-screen-header";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";

type AuthWithVisualLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthWithVisualLayout({
  title,
  description,
  children,
}: AuthWithVisualLayoutProps) {
  return (
    <div className="relative min-h-svh bg-background">
      <div className="absolute top-6 left-4 z-10 md:left-8 lg:left-12">
        <AuthBrand />
      </div>
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 pt-28 pb-6 md:px-8 md:pt-32 lg:px-12">
        <div className="flex flex-1 flex-col gap-10 xl:flex-row xl:items-stretch">
          <div className="flex w-full max-w-2xl flex-col justify-center gap-8 xl:max-w-[34rem]">
            <AuthScreenHeader title={title} description={description} />
            <div>{children}</div>
          </div>
          <AuthVisualPanel />
        </div>
      </div>
    </div>
  );
}
