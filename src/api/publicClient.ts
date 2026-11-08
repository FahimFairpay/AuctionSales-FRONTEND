import { resolveApiBase } from "../config";
import { ApiError } from "./errors";

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

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

/**
 * Executes unauthenticated public requests without attaching Cognito ID tokens.
 * Never forces redirects to /sign-in on 401.
 */
export async function publicApiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${resolveApiBase(path)}${path}`, { ...init, headers, cache: "no-store" });
  const envelope = await parseBody(response);

  if (!response.ok || envelope.success === false) {
    throw new ApiError(
      response.status,
      envelope.message || response.statusText || "Public API request failed"
    );
  }

  return envelope.data as T;
}

export function publicApiGet<T>(path: string): Promise<T> {
  return publicApiRequest<T>(path);
}

export function publicApiPost<T>(path: string, body?: unknown): Promise<T> {
  return publicApiRequest<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
