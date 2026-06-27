// Auth context: bridges the framework-agnostic session manager into React.
//
// - On load, if a refresh token exists, silently refresh + fetch /users/me before
//   rendering protected routes.
// - Enforces staff-only access (any staff account); non-staff logins are rejected.
// - Exposes the operator's effective permissions + a can() helper for surface gating.
//
// Author: Hasif Ahmed (www.hasif.info)

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, type Schemas } from "@/api/client";
import { ApiError } from "@/lib/errors";
import * as session from "./session";

export type Me = Schemas["MeOut"];

export interface AuthState {
  status: "loading" | "authenticated" | "anonymous";
  me: Me | null;
  roles: string[];
  permissions: string[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** True when the operator holds the given permission (super-admin holds all). */
  can: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthState | null>(null);

class NotStaffError extends Error {
  constructor() {
    super("This account is not a staff account. Admin access is restricted to staff roles.");
    this.name = "NotStaffError";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState["status"]>("loading");
  const [me, setMe] = useState<Me | null>(null);

  const loadMe = useCallback(async (): Promise<Me> => {
    const data = await api.get<Me>("/users/me", { noRetry: true });
    if (!data.is_staff) {
      throw new NotStaffError();
    }
    return data;
  }, []);

  // Silent refresh on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session.hasSession()) {
        if (!cancelled) setStatus("anonymous");
        return;
      }
      const token = await session.refreshTokens();
      if (!token) {
        if (!cancelled) setStatus("anonymous");
        return;
      }
      try {
        const data = await loadMe();
        if (!cancelled) {
          setMe(data);
          setStatus("authenticated");
        }
      } catch {
        session.clearSession();
        if (!cancelled) {
          setMe(null);
          setStatus("anonymous");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMe]);

  // React to external session clears (e.g. failed refresh during a request).
  useEffect(() => {
    return session.subscribe(() => {
      if (!session.getAccessToken() && !session.hasSession()) {
        setMe(null);
        setStatus("anonymous");
      }
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await session.login({ email, password });
      try {
        const data = await loadMe();
        setMe(data);
        setStatus("authenticated");
      } catch (err) {
        session.clearSession();
        setMe(null);
        setStatus("anonymous");
        if (err instanceof NotStaffError) throw err;
        if (err instanceof ApiError) throw err;
        throw err;
      }
    },
    [loadMe],
  );

  const logout = useCallback(async () => {
    await session.logout();
    setMe(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthState>(() => {
    const permissions = me?.permissions ?? [];
    const permSet = new Set(permissions);
    return {
      status,
      me,
      roles: me?.roles ?? [],
      permissions,
      login,
      logout,
      can: (permission: string) => permSet.has(permission),
    };
  }, [status, me, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
