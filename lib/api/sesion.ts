import { cookies } from "next/headers";

export const COOKIE_SESION = "sid";

export async function obtenerToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_SESION)?.value;
}

/** Guarda el token de sesión del backend en una cookie httpOnly del front. Solo en Server Actions / Route Handlers. */
export async function guardarSesion(token: string, expiresAt: string): Promise<void> {
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function borrarSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_SESION);
}
