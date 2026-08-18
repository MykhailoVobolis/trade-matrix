import type { ReactNode } from "react";

import {
  AlertCircleIcon,
  BadgeCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const messageVariants = {
  info: {
    icon: InfoIcon,
    className:
      "border-border/80 bg-muted/40 text-foreground [&_svg]:text-sidebar-primary",
  },
  success: {
    icon: BadgeCheckIcon,
    className:
      "border-emerald-200/80 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400",
  },
  warning: {
    icon: TriangleAlertIcon,
    className:
      "border-amber-200/80 bg-amber-50/70 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
  },
  error: {
    icon: AlertCircleIcon,
    className:
      "border-destructive/20 bg-destructive/10 text-destructive dark:border-destructive/30 dark:bg-destructive/15 [&_svg]:text-destructive",
  },
} as const;

type AuthInlineMessageProps = {
  title?: string;
  children: ReactNode;
  variant?: keyof typeof messageVariants;
  className?: string;
};

export function AuthInlineMessage({
  title,
  children,
  variant = "info",
  className,
}: AuthInlineMessageProps) {
  const config = messageVariants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-sm",
        config.className,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-0.5">
        {title ? <p className="font-medium">{title}</p> : null}
        <div className="text-sm/6">{children}</div>
      </div>
    </div>
  );
}
