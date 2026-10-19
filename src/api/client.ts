import { apiBaseUrl } from "../config";
import { getIdToken, signOut } from "../auth/session";
import { ApiError } from "./errors";

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

/** Survives CloudFront OAC, which replaces Authorization with its own signature. */
export const FAIR_TOKEN_HEADER = "X-Fair-Token";

export function withAuthHeaders(token: string, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Authorization", token);
  headers.set(FAIR_TOKEN_HEADER, token);
  return headers;
}

async function parseBody(response: Response): Promise<Envelope<unknown>> {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text) as Envelope<unknown>;
  } catch {
    return { success: false, message: text.slice(0, 400) };
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const headers = withAuthHeaders(token, init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (response.status === 401) {
    await signOut();
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.assign(`/sign-in?next=${next}`);
    throw new ApiError(401, "Session expired. Sign in again.");
  }
  const envelope = await parseBody(response);
  if (!response.ok || envelope.success === false) {
    throw new ApiError(
      response.status,
      envelope.message || response.statusText || "Request failed",
    );
  }
  return envelope.data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export function apiSend<T>(path: string, method: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
