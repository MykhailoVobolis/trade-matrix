"use client";

import Link from "next/link";
import { useEffect } from "react";

import { AuthFormOnlyLayout } from "@/components/auth/auth-form-only-layout";
import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { AuthStatusContent } from "@/components/auth/auth-status-content";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";

export default function PasswordChangedPage() {
  const signOut = useAuthSessionStore((state) => state.signOut);

  useEffect(() => {
    signOut();
  }, [signOut]);

  return (
    <AuthFormOnlyLayout>
      <AuthFormShell className="border-none bg-transparent shadow-none ring-0">
        <AuthStatusContent
          title="Password changed"
          description="You can now return to the sign-in screen and access your TradeMatrix workspace with the new password."
          action={
            <p className="text-sm text-muted-foreground">
              Back to{" "}
              <Link
                href="/app/sign-in"
                className="font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
              >
                Sign in
              </Link>
            </p>
          }
        />
      </AuthFormShell>
    </AuthFormOnlyLayout>
  );
}
