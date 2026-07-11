import { construirUrlOpen5e, type RecursoOpen5e } from "./endpoints";
import type { RespuestaPaginadaOpen5e } from "./types";

const TIMEOUT_MS = 8000;

/**
 * Llama a un recurso de Open5e con timeout y un reintento único.
 * Nunca se debe invocar desde el navegador: solo desde los Route Handlers
 * de app/api/open5e/*, que actúan de proxy/cache.
 */
export async function fetchOpen5e<T>(
  recurso: RecursoOpen5e,
  params: Record<string, string | number | undefined>
): Promise<RespuestaPaginadaOpen5e<T>> {
  const url = construirUrlOpen5e(recurso, params);

  try {
    return await intentarFetch<T>(url);
  } catch (error) {
    console.error(`[open5e] primer intento falló para ${url}:`, error);
    // Reintento único antes de rendirse.
    try {
      return await intentarFetch<T>(url);
    } catch (error2) {
      console.error(`[open5e] reintento también falló para ${url}:`, error2);
      throw error2;
    }
  }
}

async function intentarFetch<T>(url: string): Promise<RespuestaPaginadaOpen5e<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const respuesta = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    if (!respuesta.ok) {
      throw new Error(`Open5e respondió ${respuesta.status} para ${url}`);
    }

    return (await respuesta.json()) as RespuestaPaginadaOpen5e<T>;
  } finally {
    clearTimeout(timeoutId);
  }
}
