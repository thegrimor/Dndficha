import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  // Origins allowed by CORS, comma-separated. Empty = no CORS.
  CORS_ORIGINS: z.string().default(""),
  // Attempts per minute and per IP on register/login.
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  // Enables POST /admin/reset-tokens (password recovery without email). At least 32 characters; if unset, the route does not exist.
  ADMIN_TOKEN: z.string().min(32).optional(),
  // Public URL of the front end; if set, the administrator receives the full link.
  WEB_URL: z.url().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = schema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
