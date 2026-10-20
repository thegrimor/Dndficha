import type { CharacterAccess } from "../../../shared-kernel/auth";
import { DomainError } from "../../../shared-kernel/domain-error";
import {
  gastarEspacio,
  knownSpellSchema,
  recuperarEspacios,
  spellbookSchema,
  type SpellBook,
  type SpellBookRepository,
} from "../domain/spellbook";

const vacio = (): SpellBook => ({ slots: {}, known: [] });

export class SpellcastingService {
  constructor(
    private repo: SpellBookRepository,
    private access: CharacterAccess
  ) {}

  getMany(characterIds: string[]) {
    return this.repo.getMany(characterIds);
  }

  async replace(characterId: string, book: unknown): Promise<void> {
    // La ficha numera los espacios con claves numéricas; JSON las entrega como string.
    await this.repo.replace(characterId, spellbookSchema.parse(book));
  }

  async obtener(userId: string, characterId: string): Promise<SpellBook> {
    await this.access.assertOwner(userId, characterId);
    return (await this.repo.getMany([characterId])).get(characterId) ?? vacio();
  }

  async agregarHechizo(userId: string, characterId: string, spell: unknown): Promise<SpellBook> {
    const libro = await this.obtener(userId, characterId);
    const nuevo = knownSpellSchema.parse(spell);
    if (libro.known.some((s) => s.slug === nuevo.slug)) {
      throw new DomainError("conflict", "Ese hechizo ya está en la ficha", "spell_already_known");
    }
    const actualizado = { ...libro, known: [...libro.known, nuevo] };
    await this.repo.replace(characterId, spellbookSchema.parse(actualizado));
    return actualizado;
  }

  async quitarHechizo(userId: string, characterId: string, slug: string): Promise<void> {
    const libro = await this.obtener(userId, characterId);
    await this.repo.replace(characterId, { ...libro, known: libro.known.filter((s) => s.slug !== slug) });
  }

  async gastarEspacio(userId: string, characterId: string, nivel: number): Promise<SpellBook> {
    const libro = await this.obtener(userId, characterId);
    const actualizado = { ...libro, slots: gastarEspacio(libro.slots, nivel) };
    await this.repo.replace(characterId, actualizado);
    return actualizado;
  }

  async descansoLargo(userId: string, characterId: string): Promise<SpellBook> {
    const libro = await this.obtener(userId, characterId);
    const actualizado = { ...libro, slots: recuperarEspacios(libro.slots) };
    await this.repo.replace(characterId, actualizado);
    return actualizado;
  }

  eliminarDe(characterId: string) {
    return this.repo.deleteAll(characterId);
  }
}
