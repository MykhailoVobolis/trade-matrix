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
  title: string;
  description: string;
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
    <Card className={cn("border-border/70 bg-card/95 shadow-sm", className)}>
      <CardHeader className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.18em] text-sidebar-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}
