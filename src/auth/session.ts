// Session/token manager (framework-agnostic).
//
// - Access token lives in memory only (cleared on reload).
// - Refresh token lives in localStorage (survives reload), and is rotated on use.
// - Refresh is single-flight: concurrent callers share one in-flight refresh.
//
// The typed API client (api/client.ts) reads the access token from here and asks
// this module to refresh on a 401. React state is layered on top via AuthContext,
// which subscribes to change notifications.
//
// Author: Hasif Ahmed (www.hasif.info)

import { API_BASE, REFRESH_TOKEN_STORAGE_KEY } from "@/lib/constants";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function hasSession(): boolean {
  return Boolean(getRefreshToken());
}

export function setTokens(tokens: TokenResponse): void {
  accessToken = tokens.access_token;
  try {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh_token);
  } catch {
    // storage unavailable; access token still works for this tab
  }
  notify();
}

export function clearSession(): void {
  accessToken = null;
  try {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
  notify();
}

/** Low-level login (used by AuthContext). Stores tokens on success. */
export async function login(identifier: { email: string; password: string }): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: identifier.email, password: identifier.password }),
  });
  if (!res.ok) {
    const { toApiError } = await import("@/lib/errors");
    throw await toApiError(res);
  }
  const tokens = (await res.json()) as TokenResponse;
  setTokens(tokens);
}

/**
 * Refresh the access token using the stored refresh token. Single-flight: many
 * concurrent 401s collapse into one network call. Returns the new access token,
 * or null if there is no refresh token or refresh failed (session is cleared).
 */
export function refreshTokens(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return Promise.resolve(null);
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/token/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearSession();
        return null;
      }
      const tokens = (await res.json()) as TokenResponse;
      setTokens(tokens);
      return tokens.access_token;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Best-effort logout: revoke the refresh token server-side, then clear locally. */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // ignore network errors on logout
    }
  }
  clearSession();
}
