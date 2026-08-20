const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

import type { AuthUser } from "@/lib/auth/auth-model";
import {
  notifySessionInvalidated,
  notifySessionRefreshed,
} from "@/lib/auth/auth-session-sync";

type RequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: BodyInit | FormData | Record<string, unknown> | undefined;
  headers?: HeadersInit;
  accessToken?: string | null;
  credentials?: RequestCredentials;
  retryOnUnauthorized?: boolean;
};

type ApiValidationIssue = {
  path?: string;
  message?: string;
};

type ApiErrorPayload = {
  message?: string;
  error?: {
    message?: string;
    details?: ApiValidationIssue[];
  };
};

type RefreshResponse = {
  accessToken: string;
  tokenType: "Bearer";
  message: string;
  user: AuthUser;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: ApiValidationIssue[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isFormData(value: RequestOptions["body"]): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as unknown;
  }

  const text = await response.text();
  return text ? text : null;
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const typedPayload = payload as ApiErrorPayload;
  return typedPayload.message ?? typedPayload.error?.message ?? fallback;
}

function getErrorDetails(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const typedPayload = payload as ApiErrorPayload;
  return typedPayload.error?.details ?? [];
}

let refreshRequestPromise: Promise<string | null> | null = null;

async function executeFetch({
  path,
  method,
  headers,
  body,
  credentials,
  accessToken,
}: {
  path: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  headers?: HeadersInit;
  body?: BodyInit;
  credentials: RequestCredentials;
  accessToken?: string | null;
}) {
  const requestHeaders = new Headers(headers);

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body,
    credentials,
  });

  const payload = await parseResponse(response);

  return {
    response,
    payload,
  };
}

async function refreshAccessToken(credentials: RequestCredentials) {
  if (refreshRequestPromise) {
    return refreshRequestPromise;
  }

  refreshRequestPromise = (async () => {
    const { response, payload } = await executeFetch({
      path: "/api/auth/refresh",
      method: "POST",
      credentials,
    });

    if (!response.ok) {
      notifySessionInvalidated();
      return null;
    }

    const refreshPayload = payload as RefreshResponse;

    notifySessionRefreshed({
      accessToken: refreshPayload.accessToken,
      currentUser: refreshPayload.user,
    });

    return refreshPayload.accessToken;
  })();

  try {
    return await refreshRequestPromise;
  } finally {
    refreshRequestPromise = null;
  }
}

export async function requestJson<T>({
  path,
  method = "GET",
  body,
  headers,
  accessToken,
  credentials = "include",
  retryOnUnauthorized = true,
}: RequestOptions): Promise<T> {
  let requestBody: BodyInit | undefined;

  if (body !== undefined) {
    if (isFormData(body)) {
      requestBody = body;
    } else if (
      typeof body === "string" ||
      body instanceof Blob ||
      body instanceof URLSearchParams ||
      body instanceof ArrayBuffer
    ) {
      requestBody = body as BodyInit;
    } else {
      const requestHeaders = new Headers(headers);
      requestHeaders.set("Content-Type", "application/json");
      headers = requestHeaders;
      requestBody = JSON.stringify(body);
    }
  }

  let { response, payload } = await executeFetch({
    path,
    method,
    headers,
    body: requestBody,
    credentials,
  });

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    accessToken &&
    path !== "/api/auth/refresh"
  ) {
    const refreshedAccessToken = await refreshAccessToken(credentials);

    if (refreshedAccessToken) {
      const retryResult = await executeFetch({
        path,
        method,
        headers,
        body: requestBody,
        credentials,
        accessToken: refreshedAccessToken,
      });

      response = retryResult.response;
      payload = retryResult.payload;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, "Request failed."),
      response.status,
      getErrorDetails(payload),
    );
  }

  return payload as T;
}
