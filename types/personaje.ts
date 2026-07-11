import type { Caracteristica } from "@/lib/dnd/constantes";
import type { EdicionDnD } from "@/lib/open5e/ediciones";

export interface FichaPersonaje {
  /** Edición de reglas del personaje (2014 o 2024/"5.5"); se fija al crearlo. */
  edicion: EdicionDnD;
  abilityScores: Record<Caracteristica, number>;
  savingThrows: Partial<Record<Caracteristica, { proficient: boolean }>>;
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
    nombre: string;
    tipo: string;
    fuente: "open5e" | "manual";
    datos?: unknown;
  }>;
  spells: {
    slots: Record<number, { total: number; used: number }>;
    known: Array<{
      slug: string;
      nombre: string;
      nivel: number;
      fuente: "open5e" | "manual";
      datos?: unknown;
      prepared?: boolean;
    }>;
  };
  features: Array<{ nombre: string; descripcion: string }>;
  proficiencies: { armor: string[]; weapons: string[]; tools: string[] };
  languages: string[];
}

export interface Personaje {
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

export function fichaVacia(): FichaPersonaje {
  return {
    edicion: "2014",
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
