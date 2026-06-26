// Tests for the session/token manager: storage + single-flight refresh.
// Author: Hasif Ahmed (www.hasif.info)

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  hasSession,
  login,
  refreshTokens,
} from "./session";

function tokenBody(access: string, refresh: string) {
  return new Response(
    JSON.stringify({
      access_token: access,
      refresh_token: refresh,
      token_type: "bearer",
      expires_in: 900,
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

describe("session", () => {
  beforeEach(() => {
    clearSession();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores access (memory) + refresh (localStorage) on login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(tokenBody("acc1", "ref1"));
    await login({ email: "staff@example.com", password: "secret123" });
    expect(getAccessToken()).toBe("acc1");
    expect(getRefreshToken()).toBe("ref1");
    expect(hasSession()).toBe(true);
  });

  it("collapses concurrent refreshes into a single network call (single-flight)", async () => {
    localStorage.setItem("wep_admin_refresh_token", "ref-old");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(tokenBody("acc-new", "ref-new"));

    const [a, b, c] = await Promise.all([refreshTokens(), refreshTokens(), refreshTokens()]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(a).toBe("acc-new");
    expect(b).toBe("acc-new");
    expect(c).toBe("acc-new");
    expect(getRefreshToken()).toBe("ref-new");
  });

  it("clears the session when refresh fails", async () => {
    localStorage.setItem("wep_admin_refresh_token", "ref-old");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 401 }));

    const result = await refreshTokens();
    expect(result).toBeNull();
    expect(hasSession()).toBe(false);
    expect(getAccessToken()).toBeNull();
  });

  it("returns null without a refresh token", async () => {
    const result = await refreshTokens();
    expect(result).toBeNull();
  });
});
