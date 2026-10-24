import type { Ability } from "./constants";
import type { DndEdition } from "./editions";

export interface CharacterSheet {
  /** Rules edition of the character (2014 or 2024/"5.5"); fixed at creation. */
  edition: DndEdition;
  abilityScores: Record<Ability, number>;
  savingThrows: Partial<Record<Ability, { proficient: boolean }>>;
  skills: Record<string, { proficient: boolean; expertise?: boolean }>;
  combat: {
    ac: number;
    initiative: number;
    speed: number;
    hp: { current: number; max: number; temp: number };
    hitDice: string;
  };
  attacks: Array<{ name: string; bonus: number; damage: string }>;
  inventory: Array<{
    slug: string;
    name: string;
    type: string;
    source: "open5e" | "manual";
    data?: unknown;
    quantity?: number;
    equipped?: boolean;
  }>;
  spells: {
    slots: Record<number, { total: number; used: number }>;
    known: Array<{
      slug: string;
      name: string;
      level: number;
      source: "open5e" | "manual";
      data?: unknown;
      prepared?: boolean;
    }>;
  };
  features: Array<{ name: string; description: string }>;
  proficiencies: { armor: string[]; weapons: string[]; tools: string[] };
  languages: string[];
}

export interface CharacterDto {
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
  sheet: CharacterSheet;
  created_at: string;
  updated_at: string;
}

export function emptySheet(): CharacterSheet {
  return {
    edition: "2014",
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    savingThrows: {},
    skills: {},
    combat: {
      ac: 10,
      initiative: 0,
      speed: 30,
      hp: { current: 10, max: 10, temp: 0 },
      hitDice: "1d8",
    },
    attacks: [],
    inventory: [],
    spells: { slots: {}, known: [] },
    features: [],
    proficiencies: { armor: [], weapons: [], tools: [] },
    languages: [],
  };
}
