import type { FastifyInstance, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { COOKIE_SESION, tokenDeRequest, type RequireAuth } from "../../../../main/http/auth";
import type { AuthService, SesionIniciada } from "../../application/auth-service";
import type { User } from "../../domain/user";

const usuarioDto = (u: User) => ({ id: u.id, email: u.email, username: u.username });

export function rutasIdentity(auth: AuthService, requireAuth: RequireAuth, opciones: { produccion: boolean; intentosPorMinuto: number }) {
  return async (app: FastifyInstance) => {
    const r = app.withTypeProvider<ZodTypeProvider>();

    const respuestaSesion = (reply: FastifyReply, s: SesionIniciada) => {
      reply.setCookie(COOKIE_SESION, s.token, {
        httpOnly: true,
        secure: opciones.produccion,
        sameSite: "lax",
        path: "/",
        expires: s.expiresAt,
      });
      // El token también va en el cuerpo: el BFF del front lo guarda en su propia cookie.
      return { user: usuarioDto(s.user), token: s.token, expiresAt: s.expiresAt.toISOString() };
    };

    // Límite estricto frente a fuerza bruta / enumeración.
    const limite = { rateLimit: { max: opciones.intentosPorMinuto, timeWindow: "1 minute" } };

    r.post(
      "/auth/register",
      { config: limite, schema: { body: z.object({ email: z.string(), username: z.string(), password: z.string() }) } },
      async (request, reply) => reply.status(201).send(respuestaSesion(reply, await auth.register(request.body)))
    );

    r.post(
      "/auth/login",
      { config: limite, schema: { body: z.object({ email: z.string(), password: z.string() }) } },
      async (request, reply) => respuestaSesion(reply, await auth.login(request.body))
    );

    app.post("/auth/logout", async (request, reply) => {
      const token = tokenDeRequest(request);
      if (token) await auth.logout(token);
      reply.clearCookie(COOKIE_SESION, { path: "/" });
      return reply.status(204).send();
    });

    app.get("/auth/me", { preHandler: requireAuth }, async (request) => {
      const user = await auth.authenticate(tokenDeRequest(request)!);
      return { user: usuarioDto(user!) };
    });
  };
}
