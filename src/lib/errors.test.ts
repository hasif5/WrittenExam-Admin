// Tests for backend error-envelope mapping.
// Author: Hasif Ahmed (www.hasif.info)

import { describe, expect, it } from "vitest";
import { ApiError, errorMessage, toApiError } from "./errors";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("toApiError", () => {
  it("maps the backend { error: { code, message } } envelope", async () => {
    const res = jsonResponse(409, { error: { code: "conflict", message: "Already exists" } });
    const err = await toApiError(res);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.code).toBe("conflict");
    expect(err.message).toBe("Already exists");
  });

  it("maps a FastAPI 422 validation array", async () => {
    const res = jsonResponse(422, {
      detail: [{ loc: ["body", "email"], msg: "value is not a valid email address" }],
    });
    const err = await toApiError(res);
    expect(err.status).toBe(422);
    expect(err.code).toBe("validation_error");
    expect(err.message).toContain("email");
  });

  it("falls back to status text for non-JSON bodies", async () => {
    const res = new Response("boom", { status: 500, statusText: "Internal Server Error" });
    const err = await toApiError(res);
    expect(err.status).toBe(500);
    expect(err.message).toBe("Internal Server Error");
  });
});

describe("errorMessage", () => {
  it("unwraps ApiError and Error", () => {
    expect(errorMessage(new ApiError(404, "not_found", "Missing", null))).toBe("Missing");
    expect(errorMessage(new Error("plain"))).toBe("plain");
    expect(errorMessage("weird")).toBe("An unexpected error occurred.");
  });
});
