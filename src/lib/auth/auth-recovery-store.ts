"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type RecoveryStep = "idle" | "code_sent" | "code_verified" | "completed";

type AuthRecoveryStore = {
  email: string | null;
  step: RecoveryStep;
  requestedAt: string | null;
  verifiedAt: string | null;
  completedAt: string | null;
  startRecovery: (email: string) => void;
  markCodeVerified: () => void;
  markRecoveryCompleted: () => void;
  clearRecovery: () => void;
};

export const useAuthRecoveryStore = create<AuthRecoveryStore>()(
  persist(
    (set) => ({
      email: null,
      step: "idle",
      requestedAt: null,
      verifiedAt: null,
      completedAt: null,
      startRecovery(email) {
        const timestamp = new Date().toISOString();

        set({
          email: email.trim().toLowerCase(),
          step: "code_sent",
          requestedAt: timestamp,
          verifiedAt: null,
          completedAt: null,
        });
      },
      markCodeVerified() {
        set({
          step: "code_verified",
          verifiedAt: new Date().toISOString(),
        });
      },
      markRecoveryCompleted() {
        set({
          step: "completed",
          completedAt: new Date().toISOString(),
        });
      },
      clearRecovery() {
        set({
          email: null,
          step: "idle",
          requestedAt: null,
          verifiedAt: null,
          completedAt: null,
        });
      },
    }),
    {
      name: "tm-auth-recovery",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);
