# @dndficha/api

Backend Fastify + Drizzle. Ver la sección *Arquitectura* del README de la raíz.

Variables: `DATABASE_URL` (obligatoria), `PORT` (3001), `CORS_ORIGINS`, `AUTH_RATE_LIMIT_MAX` (10/min por IP en login, registro y reset), `ADMIN_TOKEN`, `WEB_URL`, `LOG_LEVEL`.

Rutas: `/auth/*` (incl. `/auth/reset-password`), `/admin/reset-tokens` (solo con `ADMIN_TOKEN`), `/catalog/:recurso`, `/characters[/:id]`, `/characters/:id/{inventory,spellbook,share}`,
`/character-creation`, `/public/characters/:slug` (sin sesión) y `/health`.
La sesión se envía como `Authorization: Bearer <token>` o cookie `sid`.
