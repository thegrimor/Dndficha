import { z } from "zod";

import { DomainError } from "../../../shared-kernel/domain-error";

export const knownSpellSchema = z.object({
  slug: z.string().min(1).max(200),
  nombre: z.string().min(1).max(200),
  nivel: z.number().int().min(0).max(9),
  fuente: z.enum(["open5e", "manual"]),
  datos: z.unknown().optional(),
  prepared: z.boolean().optional(),
});

export const slotsSchema = z
  .record(
    z.string().regex(/^[1-9]$/),
    z.object({ total: z.number().int().min(0).max(99), used: z.number().int().min(0).max(99) })
  )
  .refine((s) => Object.values(s).every((x) => x.used <= x.total), {
    message: "Los espacios usados no pueden superar el total",
  });

export const spellbookSchema = z.object({
  slots: slotsSchema,
  known: z.array(knownSpellSchema).max(1000),
});

export type KnownSpell = z.infer<typeof knownSpellSchema>;
export type Slots = z.infer<typeof slotsSchema>;
export type SpellBook = { slots: Slots; known: KnownSpell[] };

export interface SpellBookRepository {
  getMany(characterIds: string[]): Promise<Map<string, SpellBook>>;
  replace(characterId: string, book: SpellBook): Promise<void>;
  deleteAll(characterId: string): Promise<void>;
}

/** Gasta un espacio de conjuro del nivel indicado. */
export function gastarEspacio(slots: Slots, nivel: number): Slots {
  const espacio = slots[String(nivel)];
  if (!espacio || espacio.used >= espacio.total) {
    throw new DomainError("conflict", `No quedan espacios de nivel ${nivel}`, "no_slots_left");
  }
  return { ...slots, [String(nivel)]: { ...espacio, used: espacio.used + 1 } };
}

/** Descanso largo: recupera todos los espacios. */
export function recuperarEspacios(slots: Slots): Slots {
  return Object.fromEntries(Object.entries(slots).map(([n, s]) => [n, { ...s, used: 0 }]));
}
