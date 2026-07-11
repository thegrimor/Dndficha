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

const TAMANO_PAGINA_AGREGADO = 100;
const MAX_PAGINAS_AGREGADO = 30;

/**
 * Trae TODAS las páginas de un recurso y las combina en un solo array.
 *
 * Se usa en vez de dejar que el cliente mande `search`/`level`/`school`/etc.
 * a Open5e, porque esos filtros no siempre se aplican del lado de Open5e
 * (parece ignorar parámetros que no reconoce y devolver todo sin filtrar).
 * Es más confiable traer el catálogo completo una vez (se cachea 1h) y
 * filtrar en el cliente.
 */
export async function fetchOpen5eCompleto<T>(recurso: RecursoOpen5e): Promise<T[]> {
  const resultados: T[] = [];
  let offset = 0;

  for (let pagina = 0; pagina < MAX_PAGINAS_AGREGADO; pagina++) {
    const datos = await fetchOpen5e<T>(recurso, { limit: TAMANO_PAGINA_AGREGADO, offset });
    resultados.push(...datos.results);
    if (!datos.next) break;
    offset += TAMANO_PAGINA_AGREGADO;
  }

  return resultados;
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
