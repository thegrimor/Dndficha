# Dndficha

D&D 5e character sheet web app with accounts, cloud storage, a character creation
wizard and a built-in SRD search ([Open5e](https://open5e.com)). The UI is in Spanish;
the code, comments and documentation are in English.

## Architecture

Monorepo with npm workspaces:

| Path | What it is |
| --- | --- |
| `/` (root) | Front end: Next.js 16 (App Router), Tailwind 4, TanStack Query. Deployed on Netlify. |
| `apps/api` | Backend: Fastify + TypeScript + Drizzle on Postgres, organized by bounded contexts (DDD). Deployed on Railway. |
| `packages/rules` | Pure D&D rules (calculations, SRD data, sheet and wizard types) shared by front end and API. |

The browser **never talks to the API**: Next Server Actions and Route Handlers call it
from the server (`lib/api/client.ts`), forwarding the session token that lives in an
`httpOnly` cookie (`sid`) of the front end itself. No CORS and no cross-site cookies.

### Bounded contexts (`apps/api/src/contexts/*`)

Each one has `domain/`, `application/`, `infrastructure/` and `interface/http/`.

- **identity**: sign up, sign in and sessions (opaque token, only its SHA-256 is stored; passwords with argon2id).
- **catalog**: anti-corruption layer over Open5e with a persistent Postgres cache (serves the stale copy if Open5e is down).
- **characters**: `Character` aggregate (identity + sheet core) and assembly of the full sheet.
- **character-creation**: validates the wizard's choices against the SRD and builds the level 1 sheet.
- **inventory**, **spellcasting** (spellbook and spell slots), **sharing** (public link).

Contexts talk through ports and domain events (e.g. `CharacterDeleted` cleans up inventory,
spells and the link). Wiring lives in `apps/api/src/main/container.ts`.
Authorization: every use case checks that the character belongs to the user (404 otherwise, without revealing it exists).

## Local development

```bash
npm install

# 1. Postgres
docker compose -f apps/api/docker-compose.yml up -d
cp apps/api/.env.example apps/api/.env
npm run db:migrate -w @dndficha/api

# 2. API (http://localhost:3001)
npm run dev -w @dndficha/api

# 3. Front end (http://localhost:3000)
cp .env.local.example .env.local      # API_URL=http://localhost:3001
npm run dev
```

## Scripts

- `npm test`: tests of all workspaces. The API ones use PGlite (real Postgres in WASM), no Docker needed.
- `npm run lint` / `npx tsc --noEmit`: front end. `npm run typecheck -w @dndficha/api`: API.
- `npm run db:generate -w @dndficha/api`: generates a Drizzle migration after changing a `schema.ts`.

## Deployment

**API on Railway**: create a service from this repo (leave Root Directory empty) and a Postgres service.
`railway.json` already defines the Dockerfile (`apps/api/Dockerfile`), the healthcheck (`/health`) and the
pre-deploy `node dist/migrate.js`. Variables of the API service:

- `DATABASE_URL`: reference to the Railway Postgres (private network URL).
- `NODE_ENV=production`
- `CORS_ORIGINS`: empty if only the Next server calls it (the usual case).
- `ADMIN_TOKEN` and `WEB_URL`: for password recovery (see Notes).

**Front end on Netlify**: `API_URL` variable with the public URL of the Railway API service.

## Notes

- Next.js 16 renamed `middleware.ts` to `proxy.ts`. Here it only checks that the session cookie
  exists; its real validity is decided by the API.
- Open5e filters poorly by `level`/`school`/`type`, so the catalog is downloaded in full (once per
  edition and resource, cached) and filtered on the client. Monsters are the exception.
- **Password recovery without email** (meant for a few trusted users): if someone forgets theirs,
  the administrator generates a single-use link (24 h) and hands it over through any channel:

  ```bash
  curl -X POST "$API_URL/admin/reset-tokens" \
    -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" \
    -d '{"email":"friend@example.com"}'
  # -> { "url": "https://your-front/restablecer?token=...", "expiresAt": "..." }
  ```

  The user opens the link, picks a new password and all their sessions are closed. A new link
  invalidates the previous one. The route only exists if the API service has `ADMIN_TOKEN`
  (>= 32 characters, e.g. `openssl rand -hex 32`); `WEB_URL` makes the response include the full link.
- No email confirmation on sign up: anyone who reaches the sign-up page can create an account.

## Conventions

Code, comments, commit messages and documentation are written in English. Only text the
end user sees (UI copy, API error messages shown in the UI, SRD content in Spanish and the
URL paths) stays in Spanish.
