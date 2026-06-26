// Auth context: bridges the framework-agnostic session manager into React.
//
// - On load, if a refresh token exists, silently refresh + fetch /users/me before
//   rendering protected routes.
// - Enforces staff-only access (admin/finance); non-staff logins are rejected.
//
// Author: Hasif Ahmed (www.hasif.info)

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api, type Schemas } from "@/api/client";
import { ApiError } from "@/lib/errors";
import { STAFF_ROLES, type StaffRole } from "@/lib/constants";
import * as session from "./session";

export type Me = Schemas["MeOut"];

export interface AuthState {
  status: "loading" | "authenticated" | "anonymous";
  me: Me | null;
  roles: string[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: StaffRole) => boolean;
}

export const AuthContext = createContext<AuthState | null>(null);

class NotStaffError extends Error {
  constructor() {
    super("This account is not a staff account. Admin access is restricted to admin/finance roles.");
    this.name = "NotStaffError";
  }
}

function isStaff(roles: string[]): boolean {
  return roles.some((r) => (STAFF_ROLES as readonly string[]).includes(r));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState["status"]>("loading");
  const [me, setMe] = useState<Me | null>(null);

  const loadMe = useCallback(async (): Promise<Me> => {
    const data = await api.get<Me>("/users/me", { noRetry: true });
    if (!isStaff(data.roles)) {
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

  const value = useMemo<AuthState>(
    () => ({
      status,
      me,
      roles: me?.roles ?? [],
      login,
      logout,
      hasRole: (role: StaffRole) => (me?.roles ?? []).includes(role),
    }),
    [status, me, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
