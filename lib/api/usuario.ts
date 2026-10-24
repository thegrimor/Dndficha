import { api, ApiError } from "./cliente";

export interface Usuario {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

/** Usuario de la sesión actual (redirige a /login si no hay sesión válida). */
export async function usuarioActual(): Promise<Usuario> {
  const { user } = await api<{ user: Usuario }>("/auth/me");
  return user;
}

export { ApiError };
