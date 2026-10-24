import { redirect } from "next/navigation";

import { getToken } from "./session";

const TIMEOUT_MS = 20_000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function urlBase(): string {
  const url = process.env.API_URL;
  if (!url) throw new Error("Missing the API_URL environment variable (backend URL).");
  return url.replace(/\/$/, "");
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** If false, the session is not sent and there is no redirect to /login (public routes). */
  authenticated?: boolean;
  /** Explicit token (login/register return a new one before it is stored in the cookie). */
  token?: string;
}

/**
 * Backend client, for server-side code only (Server Actions, Server
 * Components, Route Handlers). The browser never talks to the API: the
 * session token lives in an httpOnly cookie of the front end itself.
 *
 * With `authenticated` (the default) a 401 response redirects to /login.
 */
export async function api<T = void>(route: string, options: Options = {}): Promise<T> {
  const { method = "GET", body, authenticated = true } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";

  if (authenticated) {
    const token = options.token ?? (await getToken());
    if (!token) redirect("/login");
    headers.authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${urlBase()}${route}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(503, "api_unreachable", "No se pudo conectar con el servidor.");
  }

  if (response.status === 401 && authenticated) redirect("/login");
  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? "error",
      data?.message ?? `El servidor respondió ${response.status}.`
    );
  }
  return data as T;
}
