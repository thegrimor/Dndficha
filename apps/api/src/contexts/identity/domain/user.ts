import { DomainError } from "../../../shared-kernel/domain-error";

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

export interface Session {
  /** Hash del token entregado al cliente. */
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  /** Lanza `DomainError` conflict si el correo ya existe. */
  create(data: { email: string; username: string; passwordHash: string }): Promise<User>;
}

export interface SessionRepository {
  create(session: Session): Promise<void>;
  /** Devuelve la sesión solo si no ha caducado. */
  findActive(id: string, now: Date): Promise<Session | null>;
  delete(id: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizarEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) {
    throw new DomainError("validation", "El correo no es válido", "invalid_email");
  }
  return email;
}

export function validarContrasena(plain: string): void {
  if (plain.length < 8 || plain.length > 128) {
    throw new DomainError("validation", "La contraseña debe tener entre 8 y 128 caracteres", "invalid_password");
  }
}

export function validarUsername(raw: string): string {
  const username = raw.trim();
  if (username.length < 2 || username.length > 30) {
    throw new DomainError("validation", "El nombre de usuario debe tener entre 2 y 30 caracteres", "invalid_username");
  }
  return username;
}
