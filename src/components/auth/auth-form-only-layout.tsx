import type { ReactNode } from "react";

import { AuthBrand } from "@/components/auth/auth-brand";
import { AuthScreenHeader } from "@/components/auth/auth-screen-header";

type AuthFormOnlyLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthFormOnlyLayout({
  title,
  description,
  children,
}: AuthFormOnlyLayoutProps) {
  return (
    <div className="relative min-h-svh bg-background">
      <div className="absolute top-6 left-4 z-10 md:left-8 lg:left-12">
        <AuthBrand />
      </div>
      <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-4 pt-28 pb-6 md:px-8 md:pt-32 lg:px-12">
        <div className="mx-auto flex w-full max-w-[34rem] flex-col gap-8">
          <AuthScreenHeader
            title={title}
            description={description}
            className="text-center"
          />
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
