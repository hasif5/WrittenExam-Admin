// Backend error envelope -> typed ApiError mapping.
// Author: Hasif Ahmed (www.hasif.info)

export interface BackendErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly body: unknown;

  constructor(status: number, code: string, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/** Build an ApiError from a non-2xx Response. */
export async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  let message = response.statusText || "Request failed";
  let code = `http_${response.status}`;

  try {
    body = await response.clone().json();
    const parsed = body as BackendErrorBody;
    if (parsed?.error?.message) {
      message = parsed.error.message;
      code = parsed.error.code ?? code;
    } else if (typeof parsed?.detail === "string") {
      message = parsed.detail;
    } else if (Array.isArray(parsed?.detail)) {
      // FastAPI 422 validation array.
      const first = parsed.detail[0] as { msg?: string; loc?: unknown[] } | undefined;
      if (first?.msg) {
        const loc = Array.isArray(first.loc) ? first.loc.slice(1).join(".") : "";
        message = loc ? `${loc}: ${first.msg}` : first.msg;
      }
      code = "validation_error";
    }
  } catch {
    // non-JSON error body; keep defaults
  }

  return new ApiError(response.status, code, message, body);
}

/** Human-friendly message for any thrown value. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred.";
}
