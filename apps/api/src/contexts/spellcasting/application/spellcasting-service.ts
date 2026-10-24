import type { CharacterAccess } from "../../../shared-kernel/auth";
import { DomainError } from "../../../shared-kernel/domain-error";
import {
  spendSlot,
  knownSpellSchema,
  recoverSlots,
  spellbookSchema,
  type SpellBook,
  type SpellBookRepository,
} from "../domain/spellbook";

const empty = (): SpellBook => ({ slots: {}, known: [] });

export class SpellcastingService {
  constructor(
    private repo: SpellBookRepository,
    private access: CharacterAccess
  ) {}

  getMany(characterIds: string[]) {
    return this.repo.getMany(characterIds);
  }

  async replace(characterId: string, book: unknown): Promise<void> {
    // The sheet numbers the slots with numeric keys; JSON delivers them as strings.
    await this.repo.replace(characterId, spellbookSchema.parse(book));
  }

  async get(userId: string, characterId: string): Promise<SpellBook> {
    await this.access.assertOwner(userId, characterId);
    return (await this.repo.getMany([characterId])).get(characterId) ?? empty();
  }

  async addSpell(userId: string, characterId: string, spell: unknown): Promise<SpellBook> {
    const book = await this.get(userId, characterId);
    const incoming = knownSpellSchema.parse(spell);
    if (book.known.some((s) => s.slug === incoming.slug)) {
      throw new DomainError("conflict", "Ese hechizo ya está en la ficha", "spell_already_known");
    }
    const updated = { ...book, known: [...book.known, incoming] };
    await this.repo.replace(characterId, spellbookSchema.parse(updated));
    return updated;
  }

  async removeSpell(userId: string, characterId: string, slug: string): Promise<void> {
    const book = await this.get(userId, characterId);
    await this.repo.replace(characterId, { ...book, known: book.known.filter((s) => s.slug !== slug) });
  }

  async spendSlot(userId: string, characterId: string, level: number): Promise<SpellBook> {
    const book = await this.get(userId, characterId);
    const updated = { ...book, slots: spendSlot(book.slots, level) };
    await this.repo.replace(characterId, updated);
    return updated;
  }

  async longRest(userId: string, characterId: string): Promise<SpellBook> {
    const book = await this.get(userId, characterId);
    const updated = { ...book, slots: recoverSlots(book.slots) };
    await this.repo.replace(characterId, updated);
    return updated;
  }

  deleteFor(characterId: string) {
    return this.repo.deleteAll(characterId);
  }
}
