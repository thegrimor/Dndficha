# Contexto de build: la raíz del monorepo (Railway: Dockerfile path = apps/api/Dockerfile).
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/rules/package.json packages/rules/
RUN npm ci --workspace @dndficha/api --workspace @dndficha/rules --include-workspace-root=false
COPY packages/rules packages/rules
COPY apps/api apps/api
RUN npm run build --workspace @dndficha/api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/drizzle ./drizzle
COPY apps/api/package.json ./
USER node
CMD ["node", "dist/server.js"]
