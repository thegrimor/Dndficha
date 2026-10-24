import { createHash, randomBytes } from "node:crypto";

import { DomainError } from "../../../shared-kernel/domain-error";
import {
  normalizeEmail,
  validatePassword,
  validateUsername,
  type PasswordHasher,
  type ResetTokenRepository,
  type SessionRepository,
  type User,
  type UserRepository,
} from "../domain/user";

export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
export const RESET_LINK_DURATION_MS = 24 * 60 * 60 * 1000;

export interface StartedSession {
  user: User;
  token: string;
  expiresAt: Date;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class AuthService {
  /** Hash of a non-existent password: equalizes the response time when the email does not exist. */
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

  async register(input: { email: string; username: string; password: string }): Promise<StartedSession> {
    const email = normalizeEmail(input.email);
    const username = validateUsername(input.username);
    validatePassword(input.password);

    if (await this.users.findByEmail(email)) {
      throw new DomainError("conflict", "Ya existe una cuenta con ese correo", "email_taken");
    }
    const user = await this.users.create({ email, username, passwordHash: await this.hasher.hash(input.password) });
    return this.openSession(user);
  }

  async login(input: { email: string; password: string }): Promise<StartedSession> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());
    const hash = user?.passwordHash ?? (await this.dummyHash);
    const ok = await this.hasher.verify(hash, input.password);
    if (!user || !ok) {
      throw new DomainError("unauthorized", "Correo o contraseña incorrectos", "invalid_credentials");
    }
    return this.openSession(user);
  }

  async logout(token: string): Promise<void> {
    await this.sessions.delete(hashToken(token));
  }

  /** Resolves the user of a session token, or `null` if it does not exist or has expired. */
  async authenticate(token: string): Promise<User | null> {
    const session = await this.sessions.findActive(hashToken(token), this.now());
    if (!session) return null;
    return this.users.findById(session.userId);
  }

  /**
   * Recovery without email: the administrator generates a single-use link
   * (24 h) for a user and gets it to them on their own. A new link
   * invalidates the previous one.
   */
  async createResetLink(email: string): Promise<{ token: string; expiresAt: Date }> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user) throw new DomainError("not_found", "No existe ningún usuario con ese correo", "user_not_found");
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(this.now().getTime() + RESET_LINK_DURATION_MS);
    await this.resetTokens.replaceForUser(user.id, hashToken(token), expiresAt);
    return { token, expiresAt };
  }

  /** Sets the new password with a valid link and closes all of the user's open sessions. */
  async resetPassword(token: string, password: string): Promise<void> {
    validatePassword(password);
    const userId = await this.resetTokens.consume(hashToken(token), this.now());
    if (!userId) {
      throw new DomainError("validation", "El enlace no es válido o ha caducado", "invalid_reset_token");
    }
    await this.users.updatePassword(userId, await this.hasher.hash(password));
    await this.sessions.deleteAllForUser(userId);
  }

  private async openSession(user: User): Promise<StartedSession> {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(this.now().getTime() + SESSION_DURATION_MS);
    await this.sessions.create({ id: hashToken(token), userId: user.id, expiresAt });
    return { user, token, expiresAt };
  }
}
