export const CARACTERISTICAS = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type Caracteristica = (typeof CARACTERISTICAS)[number];

export const NOMBRES_CARACTERISTICAS: Record<Caracteristica, string> = {
  str: "Fuerza",
  dex: "Destreza",
  con: "Constitución",
  int: "Inteligencia",
  wis: "Sabiduría",
  cha: "Carisma",
};

// Bonificador de competencia por nivel de personaje (PHB, tabla de progresión).
const BONIFICADOR_COMPETENCIA_POR_NIVEL = [
  2, 2, 2, 2, // niveles 1-4
  3, 3, 3, 3, // niveles 5-8
  4, 4, 4, 4, // niveles 9-12
  5, 5, 5, 5, // niveles 13-16
  6, 6, 6, 6, // niveles 17-20
];

export function bonificadorCompetenciaPorNivel(nivel: number): number {
  const indice = Math.min(Math.max(nivel, 1), 20) - 1;
  return BONIFICADOR_COMPETENCIA_POR_NIVEL[indice];
}

export const HABILIDADES = [
  { id: "acrobatics", nombre: "Acrobacias", caracteristica: "dex" },
  { id: "animal_handling", nombre: "Trato con animales", caracteristica: "wis" },
  { id: "arcana", nombre: "Arcanos", caracteristica: "int" },
  { id: "athletics", nombre: "Atletismo", caracteristica: "str" },
  { id: "deception", nombre: "Engaño", caracteristica: "cha" },
  { id: "history", nombre: "Historia", caracteristica: "int" },
  { id: "insight", nombre: "Perspicacia", caracteristica: "wis" },
  { id: "intimidation", nombre: "Intimidación", caracteristica: "cha" },
  { id: "investigation", nombre: "Investigación", caracteristica: "int" },
  { id: "medicine", nombre: "Medicina", caracteristica: "wis" },
  { id: "nature", nombre: "Naturaleza", caracteristica: "int" },
  { id: "perception", nombre: "Percepción", caracteristica: "wis" },
  { id: "performance", nombre: "Interpretación", caracteristica: "cha" },
  { id: "persuasion", nombre: "Persuasión", caracteristica: "cha" },
  { id: "religion", nombre: "Religión", caracteristica: "int" },
  { id: "sleight_of_hand", nombre: "Juego de manos", caracteristica: "dex" },
  { id: "stealth", nombre: "Sigilo", caracteristica: "dex" },
  { id: "survival", nombre: "Supervivencia", caracteristica: "wis" },
] as const satisfies ReadonlyArray<{
  id: string;
  nombre: string;
  caracteristica: Caracteristica;
}>;
