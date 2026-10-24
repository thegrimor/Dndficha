import type { FastifyReply, FastifyRequest } from "fastify";

import type { AuthService } from "../../contexts/identity/application/auth-service";
import { DomainError } from "../../shared-kernel/domain-error";
import type { AuthenticatedUser } from "../../shared-kernel/auth";

export const COOKIE_SESION = "sid";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

/** Token de sesión: cabecera `Authorization: Bearer` (BFF del front) o cookie `sid`. */
export function tokenDeRequest(request: FastifyRequest): string | undefined {
  const cabecera = request.headers.authorization;
  if (cabecera?.startsWith("Bearer ")) return cabecera.slice(7).trim() || undefined;
  return request.cookies[COOKIE_SESION];
}

export type RequireAuth = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

export function crearRequireAuth(auth: AuthService): RequireAuth {
  return async (request) => {
    const token = tokenDeRequest(request);
    const user = token ? await auth.authenticate(token) : null;
    if (!user) throw new DomainError("unauthorized", "Sesión no válida o caducada", "unauthenticated");
    request.user = { id: user.id };
  };
}

export function usuarioActual(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) throw new DomainError("unauthorized", "Sesión no válida o caducada", "unauthenticated");
  return request.user;
}
