"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  PendingTwoFactorChallenge,
  TwoFactorMethod,
} from "@/lib/auth/auth-model";

type AuthTwoFactorStore = {
  preferredMethod: TwoFactorMethod;
  pendingChallenge: PendingTwoFactorChallenge | null;
  verifiedAt: string | null;
  startChallenge: (payload: {
    email: string;
    method: TwoFactorMethod;
    redirectTo: string;
  }) => void;
  completeChallenge: () => void;
  setPreferredMethod: (method: TwoFactorMethod) => void;
  clearChallenge: () => void;
};

export const useAuthTwoFactorStore = create<AuthTwoFactorStore>()(
  persist(
    (set) => ({
      preferredMethod: "email",
      pendingChallenge: null,
      verifiedAt: null,
      startChallenge({ email, method, redirectTo }) {
        set({
          preferredMethod: method,
          pendingChallenge: {
            email: email.trim().toLowerCase(),
            method,
            redirectTo,
            issuedAt: new Date().toISOString(),
          },
          verifiedAt: null,
        });
      },
      completeChallenge() {
        set({
          pendingChallenge: null,
          verifiedAt: new Date().toISOString(),
        });
      },
      setPreferredMethod(method) {
        set({
          preferredMethod: method,
        });
      },
      clearChallenge() {
        set({
          pendingChallenge: null,
        });
      },
    }),
    {
      name: "tm-auth-two-factor",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (state) => ({
        preferredMethod: state.preferredMethod,
        pendingChallenge: state.pendingChallenge,
        verifiedAt: state.verifiedAt,
      }),
    },
  ),
);
