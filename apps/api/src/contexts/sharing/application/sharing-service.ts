import type { CharacterAccess } from "../../../shared-kernel/auth";
import { DomainError } from "../../../shared-kernel/domain-error";
import { generateSlug, type ShareLinkRepository } from "../domain/share-link";

export class SharingService {
  constructor(
    private repo: ShareLinkRepository,
    private access: CharacterAccess,
    private generate: () => string = generateSlug
  ) {}

  async statusMany(characterIds: string[]) {
    const links = await this.repo.findMany(characterIds);
    return new Map(links.map((e) => [e.characterId, { isPublic: e.enabled, shareSlug: e.slug }]));
  }

  /** Enables the public link (keeps the slug if it existed, so links already shared do not break). */
  async enable(userId: string, characterId: string): Promise<{ shareSlug: string }> {
    await this.access.assertOwner(userId, characterId);
    const existing = await this.repo.findByCharacter(characterId);
    if (existing) {
      await this.repo.setEnabled(characterId, true);
      return { shareSlug: existing.slug };
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = this.generate();
      if (await this.repo.insert({ characterId, slug, enabled: true })) return { shareSlug: slug };
    }
    throw new DomainError("conflict", "No se pudo generar un enlace único", "slug_collision");
  }

  async disable(userId: string, characterId: string): Promise<void> {
    await this.access.assertOwner(userId, characterId);
    await this.repo.setEnabled(characterId, false);
  }

  /** Resolves a public slug to its character; only if the link is enabled. */
  async characterIdFromSlug(slug: string): Promise<string> {
    const link = await this.repo.findBySlug(slug);
    if (!link?.enabled) throw new DomainError("not_found", "Ficha no encontrada", "share_not_found");
    return link.characterId;
  }

  deleteFor(characterId: string) {
    return this.repo.delete(characterId);
  }
}
