import type { ReactNode } from "react";

import { BadgeCheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthStatusContentProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function AuthStatusContent({
  title,
  description,
  action,
  icon,
  className,
}: AuthStatusContentProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-5 text-center", className)}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-sidebar-primary/10 text-sidebar-primary">
        {icon ?? <BadgeCheckIcon className="size-7" />}
      </div>
      <div className="space-y-2">
        <h2 className="text-[36px] font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="w-full">{action}</div> : null}
    </div>
  );
}
