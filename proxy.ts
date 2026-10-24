import { NextResponse, type NextRequest } from "next/server";

const RUTAS_PROTEGIDAS = ["/personajes", "/buscador", "/perfil"];

// Next.js 16 renombró `middleware.ts` a `proxy.ts`. Aquí solo se comprueba que
// exista la cookie de sesión para redirigir rápido a /login; la validez real del
// token la decide el backend (una sesión caducada recibe 401 y redirige igualmente).
export function proxy(request: NextRequest) {
  const protegida = RUTAS_PROTEGIDAS.some((ruta) => request.nextUrl.pathname.startsWith(ruta));

  if (protegida && !request.cookies.has("sid")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/open5e).*)"],
};
