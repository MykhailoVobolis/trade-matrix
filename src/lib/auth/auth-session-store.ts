"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthUser, PendingVerification } from "@/lib/auth/auth-model";

type AuthBootstrapStatus = "idle" | "bootstrapping" | "ready";

type AuthSessionPayload = {
  accessToken: string;
  refreshToken: string | null;
  currentUser: AuthUser;
};

type AuthSessionStore = {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: AuthUser | null;
  pendingVerification: PendingVerification | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  bootstrapStatus: AuthBootstrapStatus;
  bootstrapSession: () => Promise<void>;
  completeSignIn: (payload: AuthSessionPayload) => void;
  signOut: () => void;
  setPendingVerification: (email: string) => void;
  markVerificationComplete: () => void;
  clearPendingVerification: () => void;
  updateCurrentUser: (patch: Partial<AuthUser>) => void;
};

export const useAuthSessionStore = create<AuthSessionStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      pendingVerification: null,
      isAuthenticated: false,
      isAuthReady: false,
      bootstrapStatus: "idle",
      async bootstrapSession() {
        if (get().bootstrapStatus !== "idle") {
          return;
        }

        set({
          bootstrapStatus: "bootstrapping",
        });

        await Promise.resolve();

        const { accessToken, currentUser, refreshToken } = get();

        if (!accessToken || !currentUser) {
          set({
            accessToken: null,
            refreshToken: null,
            currentUser: null,
            isAuthenticated: false,
            isAuthReady: true,
            bootstrapStatus: "ready",
          });
          return;
        }

        set({
          accessToken,
          refreshToken,
          currentUser,
          isAuthenticated: true,
          isAuthReady: true,
          bootstrapStatus: "ready",
        });
      },
      completeSignIn({ accessToken, refreshToken, currentUser }) {
        set({
          accessToken,
          refreshToken,
          currentUser,
          isAuthenticated: true,
          isAuthReady: true,
          bootstrapStatus: "ready",
        });
      },
      signOut() {
        set({
          accessToken: null,
          refreshToken: null,
          currentUser: null,
          pendingVerification: null,
          isAuthenticated: false,
          isAuthReady: true,
          bootstrapStatus: "ready",
        });
      },
      setPendingVerification(email) {
        set({
          pendingVerification: {
            email: email.trim().toLowerCase(),
            state: "code_sent",
            sentAt: new Date().toISOString(),
          },
        });
      },
      markVerificationComplete() {
        const pendingVerification = get().pendingVerification;

        if (!pendingVerification) {
          return;
        }

        set({
          pendingVerification: {
            ...pendingVerification,
            state: "verified",
          },
        });
      },
      clearPendingVerification() {
        set({
          pendingVerification: null,
        });
      },
      updateCurrentUser(patch) {
        const currentUser = get().currentUser;

        if (!currentUser) {
          return;
        }

        set({
          currentUser: {
            ...currentUser,
            ...patch,
          },
        });
      },
    }),
    {
      name: "tm-auth-session",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        currentUser: state.currentUser,
        pendingVerification: state.pendingVerification,
      }),
    },
  ),
);
