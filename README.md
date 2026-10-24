# Dndficha

Aplicación web de fichas de personaje de D&D 5e, con cuentas, guardado en la nube,
asistente de creación y un buscador integrado del SRD (vía [Open5e](https://open5e.com)).

## Arquitectura

Monorepo con npm workspaces:

| Ruta | Qué es |
| --- | --- |
| `/` (raíz) | Front: Next.js 16 (App Router), Tailwind 4, TanStack Query. Desplegado en Netlify. |
| `apps/api` | Backend: Fastify + TypeScript + Drizzle sobre Postgres, organizado por bounded contexts (DDD). Desplegado en Railway. |
| `packages/rules` | Reglas puras de D&D (cálculos, datos SRD, tipos de la ficha y del wizard) compartidas por front y API. |

El navegador **nunca habla con la API**: Server Actions y Route Handlers de Next la llaman
desde el servidor (`lib/api/cliente.ts`), reenviando el token de sesión que vive en una
cookie `httpOnly` (`sid`) del propio front. No hay CORS ni cookies entre sitios.

### Bounded contexts (`apps/api/src/contexts/*`)

Cada uno tiene `domain/`, `application/`, `infrastructure/` e `interface/http/`.

- **identity**: registro, login y sesiones (token opaco, solo se guarda su SHA-256; contraseñas con argon2id).
- **catalog**: anti-corruption layer sobre Open5e con caché persistente en Postgres (sirve la copia caducada si Open5e cae).
- **characters**: aggregate `Character` (identidad + núcleo de la ficha) y ensamblado de la ficha completa.
- **character-creation**: validación de las elecciones del wizard contra el SRD y construcción de la ficha de nivel 1.
- **inventory**, **spellcasting** (libro de hechizos y espacios de conjuro), **sharing** (enlace público).

Los contextos se comunican por puertos y por eventos de dominio (p. ej. `CharacterDeleted` limpia
inventario, hechizos y enlace). La composición está en `apps/api/src/main/container.ts`.
Autorización: cada caso de uso comprueba que el personaje es del usuario (404 si no, sin revelar que existe).

## Desarrollo local

```bash
npm install

# 1. Postgres
docker compose -f apps/api/docker-compose.yml up -d
cp apps/api/.env.example apps/api/.env
npm run db:migrate -w @dndficha/api

# 2. API (http://localhost:3001)
npm run dev -w @dndficha/api

# 3. Front (http://localhost:3000)
cp .env.local.example .env.local      # API_URL=http://localhost:3001
npm run dev
```

## Scripts

- `npm test`: tests de todos los workspaces. Los de la API usan PGlite (Postgres real en WASM), sin Docker.
- `npm run lint` / `npx tsc --noEmit`: front. `npm run typecheck -w @dndficha/api`: API.
- `npm run db:generate -w @dndficha/api`: genera una migración Drizzle tras cambiar un `schema.ts`.

## Despliegue

**API en Railway**: crear un servicio desde este repo (sin Root Directory) y un servicio Postgres.
`railway.json` ya define el Dockerfile (`apps/api/Dockerfile`), el healthcheck (`/health`) y el
pre-deploy `node dist/migrate.js`. Variables del servicio API:

- `DATABASE_URL`: referencia al Postgres de Railway (URL de red privada).
- `NODE_ENV=production`
- `CORS_ORIGINS`: vacío si solo la llama el servidor de Next (lo habitual).
- `ADMIN_TOKEN` y `WEB_URL`: para la recuperación de contraseñas (ver Notas).

**Front en Netlify**: variable `API_URL` con la URL pública del servicio API de Railway.

## Notas

- Next.js 16 renombró `middleware.ts` a `proxy.ts`. Aquí solo comprueba que exista la cookie de
  sesión; la validez real la decide la API.
- Open5e: la API filtra mal por `level`/`school`/`type`, así que el catálogo se baja completo (una
  vez por edición y recurso, cacheado) y se filtra en el cliente. Los monstruos son la excepción.
- **Recuperación de contraseña sin correo** (pensada para pocos usuarios de confianza): si alguien olvida
  la suya, el administrador genera un enlace de un solo uso (24 h) y se lo pasa por el canal que quiera:

  ```bash
  curl -X POST "$API_URL/admin/reset-tokens" \
    -H "x-admin-token: $ADMIN_TOKEN" -H "content-type: application/json" \
    -d '{"email":"amigo@example.com"}'
  # -> { "url": "https://tu-front/restablecer?token=...", "expiresAt": "..." }
  ```

  El usuario abre el enlace, elige la contraseña nueva y se cierran todas sus sesiones. Un enlace nuevo
  anula el anterior. La ruta solo existe si el servicio API tiene `ADMIN_TOKEN` (≥ 32 caracteres, p. ej.
  `openssl rand -hex 32`); `WEB_URL` hace que la respuesta traiga el enlace completo.
- Sin confirmación de correo al registrarse: cualquiera que llegue a la página de registro puede crear
  cuenta. Si no quieres eso, avísame y se añade un código de invitación.
