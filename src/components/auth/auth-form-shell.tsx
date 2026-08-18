import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthFormShellProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function AuthFormShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: AuthFormShellProps) {
  return (
    <Card
      className={cn(
        "border-border/70 bg-card/95 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      {eyebrow || title || description ? (
        <CardHeader className="space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold tracking-[0.18em] text-sidebar-primary uppercase">
              {eyebrow}
            </p>
          ) : null}
          {title ? <CardTitle className="text-2xl">{title}</CardTitle> : null}
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      {children ? (
        <CardContent className="space-y-5">{children}</CardContent>
      ) : null}
    </Card>
  );
}
