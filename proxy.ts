import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/personajes", "/buscador", "/perfil"];

// Next.js 16 renamed `middleware.ts` to `proxy.ts`. Here it is only checked that
// the session cookie exists to redirect quickly to /login; the real validity of the
// token is decided by the backend (an expired session gets a 401 and redirects anyway).
export function proxy(request: NextRequest) {
  const isProtected = PROTECTED_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtected && !request.cookies.has("sid")) {
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
