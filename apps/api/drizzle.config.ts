import { defineConfig } from "drizzle-kit";

// Cada bounded context declara su esquema en infrastructure/schema.ts.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/contexts/*/infrastructure/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
