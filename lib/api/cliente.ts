import { redirect } from "next/navigation";

import { obtenerToken } from "./sesion";

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
  if (!url) throw new Error("Falta la variable de entorno API_URL (URL del backend).");
  return url.replace(/\/$/, "");
}

interface Opciones {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Si es false no se envía la sesión ni se redirige a /login (rutas públicas). */
  autenticada?: boolean;
  /** Token explícito (login/registro devuelven uno nuevo antes de guardarlo en la cookie). */
  token?: string;
}

/**
 * Cliente del backend, solo para código de servidor (Server Actions, Server
 * Components, Route Handlers). El navegador nunca habla con la API: el token
 * de sesión vive en una cookie httpOnly del propio front.
 *
 * Con `autenticada` (por defecto) una respuesta 401 redirige a /login.
 */
export async function api<T = void>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { method = "GET", body, autenticada = true } = opciones;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";

  if (autenticada) {
    const token = opciones.token ?? (await obtenerToken());
    if (!token) redirect("/login");
    headers.authorization = `Bearer ${token}`;
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${urlBase()}${ruta}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(503, "api_unreachable", "No se pudo conectar con el servidor.");
  }

  if (respuesta.status === 401 && autenticada) redirect("/login");
  if (respuesta.status === 204) return undefined as T;

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ApiError(
      respuesta.status,
      datos?.error ?? "error",
      datos?.message ?? `El servidor respondió ${respuesta.status}.`
    );
  }
  return datos as T;
}
