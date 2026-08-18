import type { ReactNode } from "react";

import { AuthBrand } from "@/components/auth/auth-brand";
import { AuthScreenHeader } from "@/components/auth/auth-screen-header";

type AuthFormOnlyLayoutProps = {
  title?: ReactNode;
  description?: string;
  topAction?: ReactNode;
  headerClassName?: string;
  children: ReactNode;
};

export function AuthFormOnlyLayout({
  title,
  description,
  topAction,
  headerClassName,
  children,
}: AuthFormOnlyLayoutProps) {
  return (
    <div className="relative min-h-svh bg-background">
      <div className="absolute top-6 left-4 z-10 md:left-8 lg:left-12">
        <AuthBrand />
      </div>
      <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-4 pt-28 pb-6 md:px-8 md:pt-32 lg:px-12">
        <div className="flex flex-1 items-center -translate-y-8 md:-translate-y-10">
          <div className="mx-auto flex w-full max-w-[34rem] flex-col gap-8">
            {topAction ? <div className="pb-8">{topAction}</div> : null}
            {title && description ? (
              <AuthScreenHeader
                title={title}
                description={description}
                className={headerClassName ?? "px-4 text-center lg:text-center"}
              />
            ) : null}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
