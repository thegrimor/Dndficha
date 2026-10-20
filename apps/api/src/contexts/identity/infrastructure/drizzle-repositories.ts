import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt } from "drizzle-orm";

import type { Db } from "../../../main/db";
import { DomainError } from "../../../shared-kernel/domain-error";
import type { PasswordHasher, Session, SessionRepository, User, UserRepository } from "../domain/user";
import { sessions, users } from "./schema";

const esViolacionUnica = (error: unknown) =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";

export class DrizzleUserRepository implements UserRepository {
  constructor(private db: Db) {}

  async findByEmail(email: string): Promise<User | null> {
    const [fila] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return fila ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [fila] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return fila ?? null;
  }

  async create(data: { email: string; username: string; passwordHash: string }): Promise<User> {
    try {
      const [fila] = await this.db.insert(users).values(data).returning();
      return fila!;
    } catch (error) {
      if (esViolacionUnica(error)) {
        throw new DomainError("conflict", "Ya existe una cuenta con ese correo", "email_taken");
      }
      throw error;
    }
  }
}

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private db: Db) {}

  async create(session: Session): Promise<void> {
    await this.db.insert(sessions).values(session);
  }

  async findActive(id: string, now: Date): Promise<Session | null> {
    const [fila] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, id), gt(sessions.expiresAt, now)))
      .limit(1);
    return fila ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }
}

/** argon2id con los parámetros por defecto de @node-rs/argon2 (OWASP-compatibles). */
export class Argon2Hasher implements PasswordHasher {
  hash(plain: string) {
    return hash(plain);
  }
  verify(hashed: string, plain: string) {
    return verify(hashed, plain).catch(() => false);
  }
}
