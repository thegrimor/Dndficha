import type { FastifyReply, FastifyRequest } from "fastify";

import type { AuthService } from "../../contexts/identity/application/auth-service";
import { DomainError } from "../../shared-kernel/domain-error";
import type { AuthenticatedUser } from "../../shared-kernel/auth";

export const SESSION_COOKIE = "sid";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

/** Session token: `Authorization: Bearer` header (front end BFF) or `sid` cookie. */
export function requestToken(request: FastifyRequest): string | undefined {
  const header = request.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim() || undefined;
  return request.cookies[SESSION_COOKIE];
}

export type RequireAuth = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

export function createRequireAuth(auth: AuthService): RequireAuth {
  return async (request) => {
    const token = requestToken(request);
    const user = token ? await auth.authenticate(token) : null;
    if (!user) throw new DomainError("unauthorized", "Sesión no válida o caducada", "unauthenticated");
    request.user = { id: user.id };
  };
}

export function currentUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) throw new DomainError("unauthorized", "Sesión no válida o caducada", "unauthenticated");
  return request.user;
}
