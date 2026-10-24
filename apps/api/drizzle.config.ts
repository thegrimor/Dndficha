import { defineConfig } from "drizzle-kit";

// Each bounded context declares its schema in infrastructure/schema.ts.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/contexts/*/infrastructure/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
