import type { FichaPersonaje } from "@dndficha/rules";
import { fichaVacia } from "@dndficha/rules";

import type { CharacterAccess } from "../../../shared-kernel/auth";
import { DomainError } from "../../../shared-kernel/domain-error";
import type { EventBus } from "../../../shared-kernel/domain-event";
import {
  coreSchema,
  extraerCore,
  validarIdentidad,
  type Character,
  type CharacterCreated,
  type CharacterData,
  type CharacterDeleted,
  type CharacterRepository,
} from "../domain/character";
import type { InventoryPort, SharingPort, SpellbookPort } from "../domain/ports";

/** Ficha completa tal como la consume el front (misma forma que `Personaje` de @dndficha/rules). */
export interface PersonajeDto {
  id: string;
  owner_id: string;
  name: string;
  race: string | null;
  class: string | null;
  level: number;
  background: string | null;
  alignment: string | null;
  image_url: string | null;
  is_public: boolean;
  share_slug: string | null;
  sheet: FichaPersonaje;
  created_at: string;
  updated_at: string;
}

export interface CambiosPersonaje {
  name?: string;
  race?: string | null;
  class?: string | null;
  level?: number;
  background?: string | null;
  alignment?: string | null;
  imageUrl?: string | null;
  sheet?: FichaPersonaje;
}

export class CharacterService implements CharacterAccess {
  constructor(
    private repo: CharacterRepository,
    private inventory: InventoryPort,
    private spellbook: SpellbookPort,
    private sharing: SharingPort,
    private events: EventBus,
    private now: () => Date = () => new Date()
  ) {}

  async assertOwner(userId: string, characterId: string): Promise<void> {
    await this.cargarPropio(userId, characterId);
  }

  async listar(userId: string): Promise<PersonajeDto[]> {
    return this.ensamblar(await this.repo.listByOwner(userId));
  }

  async obtener(userId: string, id: string): Promise<PersonajeDto> {
    const character = await this.cargarPropio(userId, id);
    return (await this.ensamblar([character]))[0]!;
  }

  /** Lectura sin comprobar propietario: solo para casos de uso que ya validaron el acceso (p. ej. enlace público). */
  async obtenerSinComprobar(id: string): Promise<PersonajeDto | null> {
    const character = await this.repo.findById(id);
    return character ? (await this.ensamblar([character]))[0]! : null;
  }

  async crear(
    ownerId: string,
    data: Omit<CharacterData, "ownerId"> & { inventory?: FichaPersonaje["inventory"]; spells?: FichaPersonaje["spells"] }
  ): Promise<PersonajeDto> {
    validarIdentidad(data);
    const { inventory, spells, ...resto } = data;
    const character = await this.repo.insert({ ...resto, core: coreSchema.parse(resto.core), ownerId });
    if (inventory?.length) await this.inventory.replace(character.id, inventory);
    if (spells) await this.spellbook.replace(character.id, spells);

    const evento: CharacterCreated = {
      name: "CharacterCreated",
      occurredAt: this.now(),
      characterId: character.id,
      ownerId,
    };
    await this.events.publish([evento]);
    return (await this.ensamblar([character]))[0]!;
  }

  async crearEnBlanco(ownerId: string, name: string): Promise<PersonajeDto> {
    const { edicion, inventory: _inventario, spells: _hechizos, ...nucleo } = fichaVacia();
    return this.crear(ownerId, {
      name: name.trim() || "Nuevo personaje",
      race: null,
      class: null,
      level: 1,
      background: null,
      alignment: null,
      imageUrl: null,
      edition: edicion,
      core: coreSchema.parse(nucleo),
    });
  }

  async actualizar(userId: string, id: string, cambios: CambiosPersonaje): Promise<PersonajeDto> {
    const actual = await this.cargarPropio(userId, id);
    const { sheet, ...identidad } = cambios;
    validarIdentidad(identidad);

    if (sheet && sheet.edicion !== actual.edition) {
      throw new DomainError("validation", "La edición de reglas no se puede cambiar", "edition_immutable");
    }

    const actualizado = await this.repo.update(id, {
      ...identidad,
      ...(sheet ? { core: extraerCore(sheet) } : {}),
    });
    if (sheet) {
      await this.inventory.replace(id, sheet.inventory);
      await this.spellbook.replace(id, sheet.spells);
    }
    return (await this.ensamblar([actualizado]))[0]!;
  }

  async eliminar(userId: string, id: string): Promise<void> {
    await this.cargarPropio(userId, id);
    await this.repo.delete(id);
    const evento: CharacterDeleted = { name: "CharacterDeleted", occurredAt: this.now(), characterId: id };
    await this.events.publish([evento]);
  }

  private async cargarPropio(userId: string, id: string): Promise<Character> {
    const character = await this.repo.findById(id);
    // 404 también para fichas ajenas: no se revela que existan.
    if (!character || character.ownerId !== userId) {
      throw new DomainError("not_found", "Personaje no encontrado", "character_not_found");
    }
    return character;
  }

  private async ensamblar(characters: Character[]): Promise<PersonajeDto[]> {
    const ids = characters.map((c) => c.id);
    const [inventarios, libros, comparticion] = await Promise.all([
      this.inventory.listMany(ids),
      this.spellbook.getMany(ids),
      this.sharing.statusMany(ids),
    ]);

    return characters.map((c) => {
      const estado = comparticion.get(c.id);
      return {
        id: c.id,
        owner_id: c.ownerId,
        name: c.name,
        race: c.race,
        class: c.class,
        level: c.level,
        background: c.background,
        alignment: c.alignment,
        image_url: c.imageUrl,
        is_public: estado?.isPublic ?? false,
        share_slug: estado?.shareSlug ?? null,
        sheet: {
          edicion: c.edition,
          ...c.core,
          inventory: inventarios.get(c.id) ?? [],
          spells: libros.get(c.id) ?? { slots: {}, known: [] },
        },
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
      };
    });
  }
}
