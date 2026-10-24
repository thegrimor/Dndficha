import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main/server.ts", "src/main/migrate.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  outDir: "dist",
  clean: true,
  // El paquete de reglas es TypeScript fuente: se incluye dentro del bundle.
  noExternal: ["@dndficha/rules"],
});
