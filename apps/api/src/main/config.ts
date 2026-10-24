import { z } from "zod";

const esquema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  // Orígenes permitidos por CORS, separados por comas. Vacío = sin CORS.
  CORS_ORIGINS: z.string().default(""),
  // Intentos por minuto y por IP en registro/login.
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  // Habilita POST /admin/reset-tokens (recuperación de contraseña sin correo). Mínimo 32 caracteres; sin definir, la ruta no existe.
  ADMIN_TOKEN: z.string().min(32).optional(),
  // URL pública del front; si está, el administrador recibe el enlace completo.
  WEB_URL: z.url().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type Config = z.infer<typeof esquema>;

export function cargarConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const resultado = esquema.safeParse(env);
  if (!resultado.success) {
    throw new Error(`Configuración inválida:\n${z.prettifyError(resultado.error)}`);
  }
  return resultado.data;
}
