"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuthSessionStore } from "@/lib/auth/auth-session-store";

type PrivateRouteGuardProps = {
  children: ReactNode;
};

export function PrivateRouteGuard({ children }: PrivateRouteGuardProps) {
  const router = useRouter();
  const restoreSessionFromRefresh = useAuthSessionStore(
    (state) => state.restoreSessionFromRefresh,
  );
  const isAuthReady = useAuthSessionStore((state) => state.isAuthReady);
  const isAuthenticated = useAuthSessionStore((state) => state.isAuthenticated);
  const hasTriedCookieRestoreRef = useRef(false);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isAuthenticated) {
      if (hasTriedCookieRestoreRef.current) {
        router.replace("/app/sign-in");
        return;
      }

      hasTriedCookieRestoreRef.current = true;
      void restoreSessionFromRefresh().then((restored) => {
        if (!restored) {
          router.replace("/app/sign-in");
        }
      });
    }
  }, [isAuthReady, isAuthenticated, restoreSessionFromRefresh, router]);

  if (!isAuthReady) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
