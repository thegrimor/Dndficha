import { NextResponse, type NextRequest } from "next/server";

import { api, ApiError } from "@/lib/api/cliente";
import { obtenerToken } from "@/lib/api/sesion";

// Puente entre el navegador y el catálogo del backend (contexto Catalog): el
// navegador no habla nunca con la API directamente. La caché de Open5e vive en
// el backend; aquí solo se reenvían la sesión y los filtros permitidos.
const PARAMS_PERMITIDOS = ["edicion", "search", "type", "cr", "limit", "offset"];

export async function GET(request: NextRequest, { params }: { params: Promise<{ recurso: string }> }) {
  if (!(await obtenerToken())) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { recurso } = await params;
  const consulta = new URLSearchParams();
  for (const clave of PARAMS_PERMITIDOS) {
    const valor = request.nextUrl.searchParams.get(clave);
    if (valor) consulta.set(clave, valor);
  }

  try {
    const datos = await api(`/catalog/${encodeURIComponent(recurso)}?${consulta.toString()}`, { autenticada: true });
    return NextResponse.json(datos, {
      // `private`: la respuesta pasó por una ruta autenticada, no debe cachearla un CDN compartido.
      headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status < 500 && error.status !== 503) {
      return NextResponse.json({ error: error.code }, { status: error.status });
    }
    console.error(`[catalog] GET /api/open5e/${recurso} falló:`, error);
    return NextResponse.json({ error: "open5e_unavailable" }, { status: 503 });
  }
}
