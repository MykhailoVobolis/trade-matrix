"use client";

import { useEffect } from "react";

import { useAuthRecoveryStore } from "@/lib/auth/auth-recovery-store";
import { useAuthSessionStore } from "@/lib/auth/auth-session-store";
import { useAuthTwoFactorStore } from "@/lib/auth/auth-two-factor-store";

export function AuthStateBootstrap() {
  useEffect(() => {
    void Promise.all([
      useAuthSessionStore.persist.rehydrate(),
      useAuthRecoveryStore.persist.rehydrate(),
      useAuthTwoFactorStore.persist.rehydrate(),
    ]).then(() => useAuthSessionStore.getState().bootstrapSession());
  }, []);

  return null;
}
