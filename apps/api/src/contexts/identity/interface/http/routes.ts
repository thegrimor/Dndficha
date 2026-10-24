import { timingSafeEqual } from "node:crypto";

import type { FastifyInstance, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { DomainError } from "../../../../shared-kernel/domain-error";
import { SESSION_COOKIE, requestToken, type RequireAuth } from "../../../../main/http/auth";
import type { AuthService, StartedSession } from "../../application/auth-service";
import type { User } from "../../domain/user";

const userDto = (u: User) => ({ id: u.id, email: u.email, username: u.username, createdAt: u.createdAt.toISOString() });

export function identityRoutes(auth: AuthService, requireAuth: RequireAuth, options: { production: boolean; attemptsPerMinute: number; adminToken?: string; webUrl?: string }) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();

    const sessionResponse = (reply: FastifyReply, s: StartedSession) => {
      reply.setCookie(SESSION_COOKIE, s.token, {
        httpOnly: true,
        secure: options.production,
        sameSite: "lax",
        path: "/",
        expires: s.expiresAt,
      });
      // The token is also in the body: the front end's BFF stores it in its own cookie.
      return { user: userDto(s.user), token: s.token, expiresAt: s.expiresAt.toISOString() };
    };

    // Strict limit against brute force / enumeration.
    const limit = { rateLimit: { max: options.attemptsPerMinute, timeWindow: "1 minute" } };

    r.post(
      "/auth/register",
      { config: limit, schema: { body: z.object({ email: z.string(), username: z.string(), password: z.string() }) } },
      async (request, reply) => reply.status(201).send(sessionResponse(reply, await auth.register(request.body)))
    );

    r.post(
      "/auth/login",
      { config: limit, schema: { body: z.object({ email: z.string(), password: z.string() }) } },
      async (request, reply) => sessionResponse(reply, await auth.login(request.body))
    );

    r.post(
      "/auth/reset-password",
      { config: limit, schema: { body: z.object({ token: z.string().min(1).max(200), password: z.string() }) } },
      async (request, reply) => {
        await auth.resetPassword(request.body.token, request.body.password);
        return reply.status(204).send();
      }
    );

    // Only exists when ADMIN_TOKEN is set: it is the way to recover passwords without email.
    if (options.adminToken) {
      const expected = Buffer.from(options.adminToken);
      r.post(
        "/admin/reset-tokens",
        { config: limit, schema: { body: z.object({ email: z.string() }) } },
        async (request) => {
          const received = Buffer.from(String(request.headers["x-admin-token"] ?? ""));
          if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
            throw new DomainError("forbidden", "Token de administración no válido", "invalid_admin_token");
          }
          const { token, expiresAt } = await auth.createResetLink(request.body.email);
          const route = `/restablecer?token=${token}`;
          return {
            token,
            expiresAt: expiresAt.toISOString(),
            url: options.webUrl ? `${options.webUrl.replace(/\/$/, "")}${route}` : route,
          };
        }
      );
    }

    app.post("/auth/logout", async (request, reply) => {
      const token = requestToken(request);
      if (token) await auth.logout(token);
      reply.clearCookie(SESSION_COOKIE, { path: "/" });
      return reply.status(204).send();
    });

    app.get("/auth/me", { preHandler: requireAuth }, async (request) => {
      const user = await auth.authenticate(requestToken(request)!);
      return { user: userDto(user!) };
    });
  };
}
