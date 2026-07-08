# Dndficha

Aplicación web de fichas de personaje de D&D 5e, con guardado en la nube y un
buscador integrado de hechizos/objetos del SRD (vía [Open5e](https://open5e.com)).

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript
- Tailwind CSS 4 (componentes propios estilo shadcn en `components/ui/`)
- [Supabase](https://supabase.com) (Auth + Postgres) para cuentas y guardado de fichas
- [Open5e API](https://open5e.com/api-docs) como fuente del contenido SRD (hechizos, objetos, razas, clases...)
- react-hook-form + zod, TanStack Query, Vitest

## Setup

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto en [Supabase](https://supabase.com/dashboard), copiar
   `.env.local.example` a `.env.local` y completar `NEXT_PUBLIC_SUPABASE_URL`
   y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).

3. Aplicar las migraciones de `supabase/migrations/` (crean las tablas
   `profiles`/`characters` y sus políticas de RLS) desde el SQL Editor del
   proyecto de Supabase, o con la Supabase CLI si la tienes instalada:

   ```bash
   supabase link --project-ref <tu-project-ref>
   supabase db push
   ```

4. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm test` — tests unitarios (Vitest), por ahora cubren `lib/dnd/calculos.ts`

## Notas de esta implementación inicial

- **`proxy.ts`**: Next.js 16 renombró `middleware.ts` a `proxy.ts` (la función
  pasó de `middleware` a `proxy`). La lógica de sesión vive en
  `lib/supabase/middleware.ts` y se invoca desde `proxy.ts` en la raíz.
- **shadcn/ui**: el entorno donde se generó este scaffold no tenía acceso de
  red a `ui.shadcn.com`, así que los componentes en `components/ui/` están
  escritos a mano siguiendo las mismas convenciones (cva + `cn()`), sin pasar
  por el CLI. Se puede correr `npx shadcn@latest add <componente>` más
  adelante en un entorno con acceso a internet para traer componentes
  adicionales sin romper lo existente.
- **Open5e**: por la misma razón, los endpoints en `lib/open5e/endpoints.ts`
  no se pudieron verificar en vivo contra `api.open5e.com`. Antes de confiar
  en ellos, comprobar el contrato real en https://open5e.com/api-docs.

## Estructura del proyecto

Ver el plan completo de fases en el historial de la sesión de planificación;
resumen de carpetas:

- `app/(auth)` — login, registro, callback de confirmación
- `app/(app)` — rutas protegidas: listado/CRUD de personajes, buscador SRD
- `app/api/open5e/*` — proxy con cache hacia la API de Open5e
- `components/ficha` — bloques de la hoja de personaje
- `components/wizard` — pasos del asistente de creación (Fase 4, pendiente)
- `components/buscador` — buscador de hechizos/objetos (Fase 5, pendiente)
- `lib/dnd` — fórmulas puras (modificadores, CA, competencia, etc.)
- `lib/supabase`, `lib/open5e` — clientes e integraciones
- `actions/` — Server Actions (auth, CRUD de personajes)
- `supabase/migrations` — esquema SQL y políticas RLS
