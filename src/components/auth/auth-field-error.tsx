import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthFieldErrorProps = {
  children?: ReactNode;
  className?: string;
};

export function AuthFieldError({ children, className }: AuthFieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p className={cn("text-sm text-destructive", className)}>{children}</p>
  );
}
