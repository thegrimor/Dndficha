import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt, isNull } from "drizzle-orm";

import type { Db } from "../../../main/db";
import { DomainError } from "../../../shared-kernel/domain-error";
import type { PasswordHasher, ResetTokenRepository, Session, SessionRepository, User, UserRepository } from "../domain/user";
import { passwordResetTokens, sessions, users } from "./schema";

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";

export class DrizzleUserRepository implements UserRepository {
  constructor(private db: Db) {}

  async updatePassword(userId: string, passwordHash: string) {
    await this.db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  async create(data: { email: string; username: string; passwordHash: string }): Promise<User> {
    try {
      const [row] = await this.db.insert(users).values(data).returning();
      return row!;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DomainError("conflict", "Ya existe una cuenta con ese correo", "email_taken");
      }
      throw error;
    }
  }
}

export class DrizzleResetTokenRepository implements ResetTokenRepository {
  constructor(private db: Db) {}

  async replaceForUser(userId: string, tokenId: string, expiresAt: Date) {
    await this.db.transaction(async (tx) => {
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
      await tx.insert(passwordResetTokens).values({ id: tokenId, userId, expiresAt });
    });
  }

  async consume(tokenId: string, now: Date) {
    const [row] = await this.db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(
        and(eq(passwordResetTokens.id, tokenId), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, now))
      )
      .returning({ userId: passwordResetTokens.userId });
    return row?.userId ?? null;
  }
}

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private db: Db) {}

  async create(session: Session): Promise<void> {
    await this.db.insert(sessions).values(session);
  }

  async findActive(id: string, now: Date): Promise<Session | null> {
    const [row] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, id), gt(sessions.expiresAt, now)))
      .limit(1);
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }
}

/** argon2id with the default parameters of @node-rs/argon2 (OWASP-compatible). */
export class Argon2Hasher implements PasswordHasher {
  hash(plain: string) {
    return hash(plain);
  }
  verify(hashed: string, plain: string) {
    return verify(hashed, plain).catch(() => false);
  }
}
