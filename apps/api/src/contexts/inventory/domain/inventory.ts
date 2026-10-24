import { z } from "zod";

export const itemSchema = z.object({
  slug: z.string().min(1).max(200),
  nombre: z.string().min(1).max(200),
  tipo: z.string().max(100),
  fuente: z.enum(["open5e", "manual"]),
  datos: z.unknown().optional(),
  cantidad: z.number().int().min(1).max(9999).default(1),
  equipado: z.boolean().default(false),
});

export type InventoryItem = z.infer<typeof itemSchema>;

export const MAX_ITEMS = 500;

export interface InventoryRepository {
  listMany(characterIds: string[]): Promise<Map<string, InventoryItem[]>>;
  replace(characterId: string, items: InventoryItem[]): Promise<void>;
  deleteAll(characterId: string): Promise<void>;
}
