import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renombró `middleware.ts` a `proxy.ts` (la función también pasó
// de llamarse `middleware` a `proxy`). La lógica de refresco de sesión de
// Supabase vive en lib/supabase/middleware.ts para poder testearla aislada.
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/open5e).*)",
  ],
};
