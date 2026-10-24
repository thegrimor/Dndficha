import { z } from "zod";

import { DomainError } from "../../../shared-kernel/domain-error";

export const knownSpellSchema = z.object({
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  level: z.number().int().min(0).max(9),
  source: z.enum(["open5e", "manual"]),
  data: z.unknown().optional(),
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

/** Spends a spell slot of the given level. */
export function spendSlot(slots: Slots, level: number): Slots {
  const slot = slots[String(level)];
  if (!slot || slot.used >= slot.total) {
    throw new DomainError("conflict", `No quedan espacios de nivel ${level}`, "no_slots_left");
  }
  return { ...slots, [String(level)]: { ...slot, used: slot.used + 1 } };
}

/** Long rest: recovers all slots. */
export function recoverSlots(slots: Slots): Slots {
  return Object.fromEntries(Object.entries(slots).map(([n, s]) => [n, { ...s, used: 0 }]));
}
