import type { AuthUser } from "@/lib/auth/auth-model";

type AuthSessionSyncHandlers = {
  onSessionRefreshed?: (payload: {
    accessToken: string;
    currentUser: AuthUser;
  }) => void;
  onSessionInvalidated?: () => void;
};

const handlers: AuthSessionSyncHandlers = {};

export function setAuthSessionSyncHandlers(
  nextHandlers: AuthSessionSyncHandlers,
) {
  handlers.onSessionRefreshed = nextHandlers.onSessionRefreshed;
  handlers.onSessionInvalidated = nextHandlers.onSessionInvalidated;
}

export function notifySessionRefreshed(payload: {
  accessToken: string;
  currentUser: AuthUser;
}) {
  handlers.onSessionRefreshed?.(payload);
}

export function notifySessionInvalidated() {
  handlers.onSessionInvalidated?.();
}
