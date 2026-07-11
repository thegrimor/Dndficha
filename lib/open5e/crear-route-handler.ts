import { NextResponse, type NextRequest } from "next/server";

import { fetchOpen5e } from "./client";
import type { RecursoOpen5e } from "./endpoints";

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
