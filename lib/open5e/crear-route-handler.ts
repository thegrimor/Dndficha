import { NextResponse, type NextRequest } from "next/server";

import { fetchOpen5e, fetchOpen5eCompleto, fetchOpen5eV2CompletoPorDocumento } from "./client";
import { DOCUMENT_KEY_POR_EDICION, edicionDesdeParam } from "./ediciones";
import type { RecursoOpen5e, RecursoOpen5eV2 } from "./endpoints";

/**
 * Crea el handler GET de un Route Handler de app/api/open5e/*.
 * Reenvía `search`, `ordering`, `limit` y `offset`, más cualquier filtro
 * extra propio del recurso (ej. `level`/`school` para hechizos).
 */
export function crearRouteHandlerOpen5e(
  recurso: RecursoOpen5e,
  filtrosExtra: string[] = []
) {
  return async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const params: Record<string, string | undefined> = {
      search: searchParams.get("search") ?? undefined,
      ordering: searchParams.get("ordering") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    };

    for (const filtro of filtrosExtra) {
      params[filtro] = searchParams.get(filtro) ?? undefined;
    }

    try {
      const datos = await fetchOpen5e(recurso, params);
      return NextResponse.json(datos, {
        headers: {
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    } catch (error) {
      console.error(`[open5e] GET /api/open5e/${recurso} falló:`, error);
      return NextResponse.json({ error: "open5e_unavailable" }, { status: 503 });
    }
  };
}

/**
 * Variante que devuelve el catálogo COMPLETO de un recurso (todas las
 * páginas combinadas) en `{ results: T[] }`, sin filtros de Open5e. El
 * filtrado (texto, nivel, escuela, tipo...) se hace en el cliente porque
 * Open5e no siempre respeta esos parámetros. Pensado para catálogos
 * manejables (cientos de items), no para recursos muy grandes.
 */
export function crearRouteHandlerOpen5eCompleto(recurso: RecursoOpen5e) {
  return async function GET() {
    try {
      const resultados = await fetchOpen5eCompleto(recurso);
      return NextResponse.json(
        { results: resultados },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      );
    } catch (error) {
      console.error(`[open5e] GET /api/open5e/${recurso} (completo) falló:`, error);
      return NextResponse.json({ error: "open5e_unavailable" }, { status: 503 });
    }
  };
}

/**
 * Variante v2 que devuelve el catálogo COMPLETO de un recurso filtrado por
 * la edición pedida en `?edicion=2014|2024` (default 2014). Solo v2 separa
 * el contenido por edición vía `document__key`; el resto de filtros se
 * ignora aquí a propósito, igual que en la variante v1 (se filtra en
 * cliente).
 */
export function crearRouteHandlerOpen5eV2CompletoPorEdicion(recurso: RecursoOpen5eV2) {
  return async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const edicion = edicionDesdeParam(searchParams.get("edicion"));
    const documentKey = DOCUMENT_KEY_POR_EDICION[edicion];

    try {
      const resultados = await fetchOpen5eV2CompletoPorDocumento(recurso, documentKey);
      return NextResponse.json(
        { results: resultados },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        }
      );
    } catch (error) {
      console.error(`[open5e-v2] GET /api/open5e/${recurso}?edicion=${edicion} falló:`, error);
      return NextResponse.json({ error: "open5e_unavailable" }, { status: 503 });
    }
  };
}
