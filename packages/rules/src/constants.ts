export const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type Ability = (typeof ABILITIES)[number];

export const ABILITY_NAMES: Record<Ability, string> = {
  str: "Fuerza",
  dex: "Destreza",
  con: "Constitución",
  int: "Inteligencia",
  wis: "Sabiduría",
  cha: "Carisma",
};

// Proficiency bonus by character level (PHB, progression table).
const PROFICIENCY_BONUS_BY_LEVEL = [
  2, 2, 2, 2, // levels 1-4
  3, 3, 3, 3, // levels 5-8
  4, 4, 4, 4, // levels 9-12
  5, 5, 5, 5, // levels 13-16
  6, 6, 6, 6, // levels 17-20
];

export function proficiencyBonusByLevel(level: number): number {
  const index = Math.min(Math.max(level, 1), 20) - 1;
  return PROFICIENCY_BONUS_BY_LEVEL[index];
}

export const SKILLS = [
  { id: "acrobatics", name: "Acrobacias", ability: "dex" },
  { id: "animal_handling", name: "Trato con animales", ability: "wis" },
  { id: "arcana", name: "Arcanos", ability: "int" },
  { id: "athletics", name: "Atletismo", ability: "str" },
  { id: "deception", name: "Engaño", ability: "cha" },
  { id: "history", name: "Historia", ability: "int" },
  { id: "insight", name: "Perspicacia", ability: "wis" },
  { id: "intimidation", name: "Intimidación", ability: "cha" },
  { id: "investigation", name: "Investigación", ability: "int" },
  { id: "medicine", name: "Medicina", ability: "wis" },
  { id: "nature", name: "Naturaleza", ability: "int" },
  { id: "perception", name: "Percepción", ability: "wis" },
  { id: "performance", name: "Interpretación", ability: "cha" },
  { id: "persuasion", name: "Persuasión", ability: "cha" },
  { id: "religion", name: "Religión", ability: "int" },
  { id: "sleight_of_hand", name: "Juego de manos", ability: "dex" },
  { id: "stealth", name: "Sigilo", ability: "dex" },
  { id: "survival", name: "Supervivencia", ability: "wis" },
] as const satisfies ReadonlyArray<{
  id: string;
  name: string;
  ability: Ability;
}>;
