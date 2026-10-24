# @dndficha/api

Fastify + Drizzle backend. See the *Architecture* section of the root README.

Variables: `DATABASE_URL` (required), `PORT` (3001), `CORS_ORIGINS`, `AUTH_RATE_LIMIT_MAX` (10/min per IP on login, register and reset), `ADMIN_TOKEN`, `WEB_URL`, `LOG_LEVEL`.

Routes: `/auth/*` (incl. `/auth/reset-password`), `/admin/reset-tokens` (only with `ADMIN_TOKEN`), `/catalog/:resource`, `/characters[/:id]`, `/characters/:id/{inventory,spellbook,share}`,
`/character-creation`, `/public/characters/:slug` (no session) and `/health`.
The session is sent as `Authorization: Bearer <token>` or the `sid` cookie.
