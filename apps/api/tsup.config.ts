import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main/server.ts", "src/main/migrate.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  outDir: "dist",
  clean: true,
  // The rules package is TypeScript source: it is bundled in.
  noExternal: ["@dndficha/rules"],
});
