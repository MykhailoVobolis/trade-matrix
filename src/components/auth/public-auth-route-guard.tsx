"use client";

import { useEffect, type ReactNode } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthSessionStore } from "@/lib/auth/auth-session-store";

type PublicAuthRouteGuardProps = {
  children: ReactNode;
};

export function PublicAuthRouteGuard({ children }: PublicAuthRouteGuardProps) {
  const router = useRouter();
  const isAuthReady = useAuthSessionStore((state) => state.isAuthReady);
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthReady, isAuthenticated, router]);

  if (!isAuthReady) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
}
