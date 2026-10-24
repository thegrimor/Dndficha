import { NextResponse, type NextRequest } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getToken } from "@/lib/api/session";

// Bridge between the browser and the backend catalog (Catalog context): the
// browser never talks to the API directly. The Open5e cache lives in the
// backend; here only the session and the allowed filters are forwarded.
const ALLOWED_PARAMS = ["edition", "search", "type", "cr", "limit", "offset"];

export async function GET(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  if (!(await getToken())) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { resource } = await params;
  const query = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }

  try {
    const data = await api(`/catalog/${encodeURIComponent(resource)}?${query.toString()}`, { authenticated: true });
    return NextResponse.json(data, {
      // `private`: the response went through an authenticated route and must not be cached by a shared CDN.
      headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status < 500 && error.status !== 503) {
      return NextResponse.json({ error: error.code }, { status: error.status });
    }
    console.error(`[catalog] GET /api/open5e/${resource} failed:`, error);
    return NextResponse.json({ error: "open5e_unavailable" }, { status: 503 });
  }
}
