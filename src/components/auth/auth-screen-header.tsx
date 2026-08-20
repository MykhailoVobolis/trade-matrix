import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthScreenHeaderProps = {
  title: ReactNode;
  description: string;
  className?: string;
};

export function AuthScreenHeader({
  title,
  description,
  className,
}: AuthScreenHeaderProps) {
  return (
    <div className={cn("space-y-2 text-center lg:text-left", className)}>
      <h1 className="text-[36px] font-semibold tracking-tight">{title}</h1>
      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
