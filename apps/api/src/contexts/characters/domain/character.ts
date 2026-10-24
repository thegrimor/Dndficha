import type { EdicionDnD, FichaPersonaje } from "@dndficha/rules";
import { z } from "zod";

import { DomainError } from "../../../shared-kernel/domain-error";
import type { DomainEvent } from "../../../shared-kernel/domain-event";

const puntuacion = z.number().int().min(1).max(30);
const entero = z.number().int();

/**
 * Núcleo de la ficha que pertenece al contexto Characters. El inventario y los
 * hechizos viven en sus propios contextos; la edición es una columna inmutable.
 */
export const coreSchema = z
  .object({
    abilityScores: z.object({
      str: puntuacion,
      dex: puntuacion,
      con: puntuacion,
      int: puntuacion,
      wis: puntuacion,
      cha: puntuacion,
    }),
    savingThrows: z.record(z.string(), z.object({ proficient: z.boolean() })),
    skills: z.record(z.string(), z.object({ proficient: z.boolean(), expertise: z.boolean().optional() })),
    combat: z.object({
      ac: z.number().int().min(0).max(40),
      initiative: entero,
      speed: z.number().int().min(0).max(500),
      hp: z.object({
        current: z.number().int().min(0),
        max: z.number().int().min(1),
        temp: z.number().int().min(0),
      }),
      hitDice: z.string().max(40),
    }),
    attacks: z.array(z.object({ name: z.string().max(120), bonus: entero, damage: z.string().max(120) })).max(100),
    features: z.array(z.object({ nombre: z.string().max(200), descripcion: z.string().max(20_000) })).max(300),
    proficiencies: z.object({
      armor: z.array(z.string().max(120)).max(100),
      weapons: z.array(z.string().max(120)).max(100),
      tools: z.array(z.string().max(120)).max(100),
    }),
    languages: z.array(z.string().max(120)).max(100),
  })
  .refine((c) => c.combat.hp.current <= c.combat.hp.max, {
    message: "Los puntos de golpe actuales no pueden superar el máximo",
    path: ["combat", "hp", "current"],
  });

export type CharacterCore = z.infer<typeof coreSchema>;

export function extraerCore(sheet: FichaPersonaje): CharacterCore {
  return coreSchema.parse({
    abilityScores: sheet.abilityScores,
    savingThrows: sheet.savingThrows,
    skills: sheet.skills,
    combat: sheet.combat,
    attacks: sheet.attacks,
    features: sheet.features,
    proficiencies: sheet.proficiencies,
    languages: sheet.languages,
  });
}

export interface Character {
  id: string;
  ownerId: string;
  name: string;
  race: string | null;
  class: string | null;
  level: number;
  background: string | null;
  alignment: string | null;
  imageUrl: string | null;
  edition: EdicionDnD;
  core: CharacterCore;
  createdAt: Date;
  updatedAt: Date;
}

export type CharacterData = Omit<Character, "id" | "createdAt" | "updatedAt">;

export interface CharacterRepository {
  findById(id: string): Promise<Character | null>;
  listByOwner(ownerId: string): Promise<Character[]>;
  insert(data: CharacterData): Promise<Character>;
  update(id: string, cambios: Partial<Omit<CharacterData, "ownerId" | "edition">>): Promise<Character>;
  delete(id: string): Promise<void>;
}

/** Invariantes de los campos de identidad del personaje. */
export function validarIdentidad(c: Partial<Pick<Character, "name" | "level">>): void {
  if (c.name !== undefined && (c.name.trim().length < 1 || c.name.length > 100)) {
    throw new DomainError("validation", "El nombre debe tener entre 1 y 100 caracteres", "invalid_name");
  }
  if (c.level !== undefined && (!Number.isInteger(c.level) || c.level < 1 || c.level > 20)) {
    throw new DomainError("validation", "El nivel debe estar entre 1 y 20", "invalid_level");
  }
}

export interface CharacterCreated extends DomainEvent {
  name: "CharacterCreated";
  characterId: string;
  ownerId: string;
}
export interface CharacterDeleted extends DomainEvent {
  name: "CharacterDeleted";
  characterId: string;
}
