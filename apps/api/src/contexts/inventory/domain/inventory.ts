import { z } from "zod";

export const itemSchema = z.object({
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  type: z.string().max(100),
  source: z.enum(["open5e", "manual"]),
  data: z.unknown().optional(),
  quantity: z.number().int().min(1).max(9999).default(1),
  equipped: z.boolean().default(false),
});

export type InventoryItem = z.infer<typeof itemSchema>;

export const MAX_ITEMS = 500;

export interface InventoryRepository {
  listMany(characterIds: string[]): Promise<Map<string, InventoryItem[]>>;
  replace(characterId: string, items: InventoryItem[]): Promise<void>;
  deleteAll(characterId: string): Promise<void>;
}
