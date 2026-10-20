# @dndficha/api

Backend Fastify + Drizzle. Ver la sección *Arquitectura* del README de la raíz.

Variables: `DATABASE_URL` (obligatoria), `PORT` (3001), `CORS_ORIGINS`, `AUTH_RATE_LIMIT_MAX` (10/min por IP en login y registro), `LOG_LEVEL`.

Rutas: `/auth/*`, `/catalog/:recurso`, `/characters[/:id]`, `/characters/:id/{inventory,spellbook,share}`,
`/character-creation`, `/public/characters/:slug` (sin sesión) y `/health`.
La sesión se envía como `Authorization: Bearer <token>` o cookie `sid`.
