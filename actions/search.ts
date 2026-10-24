"use server";

import { api, ApiError } from "@/lib/api/client";
import {
  open5eIdentifier,
  spellLevel,
  itemCategoryName,
  type Open5eSpell,
  type Open5eMagicItem,
} from "@dndficha/rules";

interface AddResult {
  ok: boolean;
  error?: string;
}

async function add(route: string, body: object): Promise<AddResult> {
  try {
    await api(route, { method: "POST", body: body });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) return { ok: false, error: "No se encontró esa ficha." };
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

/**
 * Adds a spell from the SRD search to a sheet's spellbook, storing a full
 * snapshot in `data` in case Open5e changes or becomes unavailable later.
 * The backend rejects duplicates.
 */
export async function addSpellToSheet(characterId: string, spell: Open5eSpell): Promise<AddResult> {
  return add(`/characters/${encodeURIComponent(characterId)}/spellbook/spells`, {
    spell: {
      slug: open5eIdentifier(spell),
      name: spell.name,
      level: spellLevel(spell),
      source: "open5e",
      data: spell,
    },
  });
}

/** Adds a (magic) item from the SRD search to a sheet's inventory. */
export async function addItemToSheet(characterId: string, item: Open5eMagicItem): Promise<AddResult> {
  return add(`/characters/${encodeURIComponent(characterId)}/inventory`, {
    item: {
      slug: open5eIdentifier(item),
      name: item.name,
      type: itemCategoryName(item),
      source: "open5e",
      data: item,
    },
  });
}
