import type { CharacterAccess } from "../../../shared-kernel/auth";
import { DomainError } from "../../../shared-kernel/domain-error";
import { generarSlug, type ShareLinkRepository } from "../domain/share-link";

export class SharingService {
  constructor(
    private repo: ShareLinkRepository,
    private access: CharacterAccess,
    private generar: () => string = generarSlug
  ) {}

  async statusMany(characterIds: string[]) {
    const enlaces = await this.repo.findMany(characterIds);
    return new Map(enlaces.map((e) => [e.characterId, { isPublic: e.enabled, shareSlug: e.slug }]));
  }

  /** Activa el enlace público (conserva el slug si ya existía, para no romper enlaces ya repartidos). */
  async activar(userId: string, characterId: string): Promise<{ shareSlug: string }> {
    await this.access.assertOwner(userId, characterId);
    const existente = await this.repo.findByCharacter(characterId);
    if (existente) {
      await this.repo.setEnabled(characterId, true);
      return { shareSlug: existente.slug };
    }
    for (let intento = 0; intento < 5; intento++) {
      const slug = this.generar();
      if (await this.repo.insert({ characterId, slug, enabled: true })) return { shareSlug: slug };
    }
    throw new DomainError("conflict", "No se pudo generar un enlace único", "slug_collision");
  }

  async desactivar(userId: string, characterId: string): Promise<void> {
    await this.access.assertOwner(userId, characterId);
    await this.repo.setEnabled(characterId, false);
  }

  /** Resuelve un slug público a su personaje; solo si el enlace está activo. */
  async personajeDeSlug(slug: string): Promise<string> {
    const enlace = await this.repo.findBySlug(slug);
    if (!enlace?.enabled) throw new DomainError("not_found", "Ficha no encontrada", "share_not_found");
    return enlace.characterId;
  }

  eliminarDe(characterId: string) {
    return this.repo.delete(characterId);
  }
}
