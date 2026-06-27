// Typed fetch client.
//
// Thin wrapper over fetch that:
//  - prefixes the API base URL,
//  - attaches the Bearer access token from the session manager,
//  - serializes JSON bodies + query params,
//  - on 401, performs a single-flight refresh and retries the request once,
//  - maps non-2xx responses to ApiError (backend { error: { code, message } }).
//
// Response/request types are taken from the generated OpenAPI schema
// (components["schemas"][...]) at each call site, so shapes cannot silently drift.
//
// Author: Hasif Ahmed (www.hasif.info)

import { API_BASE } from "@/lib/constants";
import { ApiError, toApiError } from "@/lib/errors";
import { clearSession, getAccessToken, refreshTokens } from "@/auth/session";
import type { components } from "./schema";

export type Schemas = components["schemas"];

export type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  body?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
  /** When true, a 401 will not attempt refresh (used for auth bootstrap). */
  noRetry?: boolean;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function doFetch(
  method: HttpMethod,
  path: string,
  options: RequestOptions,
  accessToken: string | null,
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData; // browser sets multipart boundary
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  return fetch(buildUrl(path, options.query), {
    method,
    headers,
    body,
    signal: options.signal,
  });
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let response = await doFetch(method, path, options, getAccessToken());

  if (response.status === 401 && !options.noRetry) {
    const newToken = await refreshTokens();
    if (newToken) {
      response = await doFetch(method, path, options, newToken);
    } else {
      clearSession();
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  // Non-JSON (e.g. asset bytes) handled by dedicated helpers below.
  return (await response.blob()) as unknown as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>("PATCH", path, options),
  put: <T>(path: string, options?: RequestOptions) => request<T>("PUT", path, options),
  del: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};

/**
 * Upload a file with real progress reporting. `fetch` cannot observe upload
 * progress, so this uses XMLHttpRequest (the one place we do) while keeping the
 * same Bearer auth + single-flight 401 refresh+retry as the JSON client.
 * `onProgress` receives a 0..1 fraction.
 */
export function uploadAssetWithProgress(
  file: File,
  onProgress?: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<Schemas["AssetOut"]> {
  return uploadOnce(file, onProgress, getAccessToken(), signal).catch(async (err) => {
    if (err instanceof ApiError && err.status === 401) {
      const newToken = await refreshTokens();
      if (newToken) return uploadOnce(file, onProgress, newToken, signal);
      clearSession();
    }
    throw err;
  });
}

function uploadOnce(
  file: File,
  onProgress: ((fraction: number) => void) | undefined,
  token: string | null,
  signal?: AbortSignal,
): Promise<Schemas["AssetOut"]> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", buildUrl("/assets/upload"));
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as Schemas["AssetOut"]);
        } catch {
          reject(new ApiError(xhr.status, "parse_error", "Invalid server response.", null));
        }
        return;
      }
      const resp = new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
      });
      reject(await toApiError(resp));
    };
    xhr.onerror = () =>
      reject(new ApiError(0, "network_error", "Network error during upload.", null));
    xhr.onabort = () => reject(new DOMException("Upload aborted", "AbortError"));

    if (signal) {
      if (signal.aborted) {
        reject(new DOMException("Upload aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

/**
 * Fetch a permissioned asset's bytes as a blob (the Authorization header is
 * required, so a plain <img src> will not work). Includes 401 refresh+retry.
 */
export async function fetchAssetBlob(assetId: string, signal?: AbortSignal): Promise<Blob> {
  const path = `/assets/${assetId}`;
  let response = await doFetch("GET", path, { signal }, getAccessToken());
  if (response.status === 401) {
    const newToken = await refreshTokens();
    if (newToken) response = await doFetch("GET", path, { signal }, newToken);
  }
  if (!response.ok) throw await toApiError(response);
  return response.blob();
}

// Asset bytes are immutable for a given id (each upload mints a new id), so the
// blob can be cached by id for the session. Consumers still create/revoke their
// own object URLs; this only dedupes the network fetch (and avoids the reload
// flicker when an editor/component remounts). Failures are not cached.
const assetBlobCache = new Map<string, Blob>();
const assetBlobInflight = new Map<string, Promise<Blob>>();

export function getAssetBlobCached(assetId: string): Promise<Blob> {
  const cached = assetBlobCache.get(assetId);
  if (cached) return Promise.resolve(cached);
  const existing = assetBlobInflight.get(assetId);
  if (existing) return existing;

  const promise = fetchAssetBlob(assetId)
    .then((blob) => {
      assetBlobCache.set(assetId, blob);
      assetBlobInflight.delete(assetId);
      return blob;
    })
    .catch((err) => {
      assetBlobInflight.delete(assetId);
      throw err;
    });
  assetBlobInflight.set(assetId, promise);
  return promise;
}
