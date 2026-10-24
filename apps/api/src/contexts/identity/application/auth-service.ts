import { createHash, randomBytes } from "node:crypto";

import { DomainError } from "../../../shared-kernel/domain-error";
import {
  normalizarEmail,
  validarContrasena,
  validarUsername,
  type PasswordHasher,
  type ResetTokenRepository,
  type SessionRepository,
  type User,
  type UserRepository,
} from "../domain/user";

export const DURACION_SESION_MS = 30 * 24 * 60 * 60 * 1000;
export const DURACION_ENLACE_RESTABLECER_MS = 24 * 60 * 60 * 1000;

export interface SesionIniciada {
  user: User;
  token: string;
  expiresAt: Date;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class AuthService {
  /** Hash de una contraseña inexistente: iguala el tiempo de respuesta cuando el correo no existe. */
  private dummyHash: Promise<string>;

  constructor(
    private users: UserRepository,
    private sessions: SessionRepository,
    private hasher: PasswordHasher,
    private resetTokens: ResetTokenRepository,
    private now: () => Date = () => new Date()
  ) {
    this.dummyHash = hasher.hash("dummy-password-for-timing");
  }

  async register(input: { email: string; username: string; password: string }): Promise<SesionIniciada> {
    const email = normalizarEmail(input.email);
    const username = validarUsername(input.username);
    validarContrasena(input.password);

    if (await this.users.findByEmail(email)) {
      throw new DomainError("conflict", "Ya existe una cuenta con ese correo", "email_taken");
    }
    const user = await this.users.create({ email, username, passwordHash: await this.hasher.hash(input.password) });
    return this.abrirSesion(user);
  }

  async login(input: { email: string; password: string }): Promise<SesionIniciada> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());
    const hash = user?.passwordHash ?? (await this.dummyHash);
    const ok = await this.hasher.verify(hash, input.password);
    if (!user || !ok) {
      throw new DomainError("unauthorized", "Correo o contraseña incorrectos", "invalid_credentials");
    }
    return this.abrirSesion(user);
  }

  async logout(token: string): Promise<void> {
    await this.sessions.delete(hashToken(token));
  }

  /** Resuelve el usuario de un token de sesión, o `null` si no existe o ha caducado. */
  async authenticate(token: string): Promise<User | null> {
    const session = await this.sessions.findActive(hashToken(token), this.now());
    if (!session) return null;
    return this.users.findById(session.userId);
  }

  /**
   * Recuperación sin correo: el administrador genera un enlace de un solo uso
   * (24 h) para un usuario y se lo hace llegar por su cuenta. Un enlace nuevo
   * anula el anterior.
   */
  async crearEnlaceRestablecer(email: string): Promise<{ token: string; expiresAt: Date }> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user) throw new DomainError("not_found", "No existe ningún usuario con ese correo", "user_not_found");
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(this.now().getTime() + DURACION_ENLACE_RESTABLECER_MS);
    await this.resetTokens.replaceForUser(user.id, hashToken(token), expiresAt);
    return { token, expiresAt };
  }

  /** Fija la contraseña nueva con un enlace válido y cierra todas las sesiones abiertas del usuario. */
  async restablecerContrasena(token: string, password: string): Promise<void> {
    validarContrasena(password);
    const userId = await this.resetTokens.consume(hashToken(token), this.now());
    if (!userId) {
      throw new DomainError("validation", "El enlace no es válido o ha caducado", "invalid_reset_token");
    }
    await this.users.updatePassword(userId, await this.hasher.hash(password));
    await this.sessions.deleteAllForUser(userId);
  }

  private async abrirSesion(user: User): Promise<SesionIniciada> {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(this.now().getTime() + DURACION_SESION_MS);
    await this.sessions.create({ id: hashToken(token), userId: user.id, expiresAt });
    return { user, token, expiresAt };
  }
}
