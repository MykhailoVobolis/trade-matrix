"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { refreshSessionRequest } from "@/lib/auth/auth-api";
import type { AuthUser, PendingVerification } from "@/lib/auth/auth-model";
import { setAuthSessionSyncHandlers } from "@/lib/auth/auth-session-sync";

type AuthBootstrapStatus = "idle" | "bootstrapping" | "ready";

type AuthSessionPayload = {
  accessToken: string;
  currentUser: AuthUser;
};

type AuthSessionStore = {
  accessToken: string | null;
  currentUser: AuthUser | null;
  pendingVerification: PendingVerification | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  bootstrapStatus: AuthBootstrapStatus;
  bootstrapSession: () => Promise<void>;
  restoreSessionFromRefresh: () => Promise<boolean>;
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

        const { accessToken, currentUser } = get();

        if (!accessToken || !currentUser) {
          set({
            accessToken: null,
            currentUser: null,
            isAuthenticated: false,
            isAuthReady: true,
            bootstrapStatus: "ready",
          });
          return;
        }

        try {
          const session = await refreshSessionRequest();

          set({
            accessToken: session.accessToken,
            currentUser: session.currentUser,
            isAuthenticated: true,
            isAuthReady: true,
            bootstrapStatus: "ready",
          });
        } catch {
          set({
            accessToken: null,
            currentUser: null,
            isAuthenticated: false,
            isAuthReady: true,
            bootstrapStatus: "ready",
          });
        }
      },
      async restoreSessionFromRefresh() {
        if (get().bootstrapStatus === "bootstrapping") {
          return false;
        }

        set({
          bootstrapStatus: "bootstrapping",
          isAuthReady: false,
        });

        try {
          const session = await refreshSessionRequest();

          set({
            accessToken: session.accessToken,
            currentUser: session.currentUser,
            isAuthenticated: true,
            isAuthReady: true,
            bootstrapStatus: "ready",
          });

          return true;
        } catch {
          set({
            accessToken: null,
            currentUser: null,
            isAuthenticated: false,
            isAuthReady: true,
            bootstrapStatus: "ready",
          });

          return false;
        }
      },
      completeSignIn({ accessToken, currentUser }) {
        set({
          accessToken,
          currentUser,
          isAuthenticated: true,
          isAuthReady: true,
          bootstrapStatus: "ready",
        });
      },
      signOut() {
        set({
          accessToken: null,
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
        currentUser: state.currentUser,
        pendingVerification: state.pendingVerification,
      }),
    },
  ),
);

setAuthSessionSyncHandlers({
  onSessionRefreshed: ({ accessToken, currentUser }) => {
    useAuthSessionStore.setState({
      accessToken,
      currentUser,
      isAuthenticated: true,
      isAuthReady: true,
      bootstrapStatus: "ready",
    });
  },
  onSessionInvalidated: () => {
    useAuthSessionStore.setState({
      accessToken: null,
      currentUser: null,
      pendingVerification: null,
      isAuthenticated: false,
      isAuthReady: true,
      bootstrapStatus: "ready",
    });
  },
});
