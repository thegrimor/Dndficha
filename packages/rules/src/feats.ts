// Origin feats (2024 edition): the character's background grants one of
// these at level 1, in addition to the ability score bonus. Curated local
// catalog: it was verified live that Open5e has no real catalog of official
// D&D feats (neither 2014 nor 2024) — its `feats` resource is
// dominated by third-party content (A5E, Tome of Heroes) and contains only
// ONE official SRD feat in the whole database, so it is not usable as a
// live source.

export interface FeatSrd {
  id: string;
  name: string;
  description: string;
}

export const FEATS_SRD: FeatSrd[] = [
  {
    id: "alert",
    name: "Alerta",
    description: "Tienes +5 a la iniciativa y no puedes ser sorprendido mientras estés consciente.",
  },
  {
    id: "crafter",
    name: "Artesano",
    description: "Ganas competencia con tres herramientas de artesano y fabricas objetos no mágicos más rápido.",
  },
  {
    id: "healer",
    name: "Sanador",
    description: "Con un kit de sanador, estabilizas a una criatura y le devuelves puntos de golpe adicionales.",
  },
  {
    id: "lucky",
    name: "Afortunado",
    description:
      "Tienes puntos de suerte que puedes gastar para obtener ventaja en una tirada o imponer desventaja a un ataque contra ti.",
  },
  {
    id: "magic-initiate",
    name: "Iniciado en magia",
    description:
      "Aprendes dos trucos y un conjuro de nivel 1 de una lista a elegir, que puedes lanzar una vez por descanso largo sin gastar espacio.",
  },
  {
    id: "musician",
    name: "Músico",
    description: "Con un instrumento musical, puedes inspirar a un aliado otorgándole un dado de inspiración.",
  },
  {
    id: "savage-attacker",
    name: "Atacante salvaje",
    description:
      "Al golpear con un arma cuerpo a cuerpo, tiras el dado de daño dos veces y te quedas con el mejor resultado.",
  },
  {
    id: "skilled",
    name: "Habilidoso",
    description: "Ganas competencia en tres habilidades a tu elección.",
  },
  {
    id: "tavern-brawler",
    name: "Camorrista de taberna",
    description:
      "Tus golpes improvisados y ataques desarmados causan más daño y pueden derribar a la criatura golpeada.",
  },
  {
    id: "tough",
    name: "Duro",
    description: "Tus puntos de golpe máximos aumentan en 2 por cada nivel que tengas.",
  },
];

/**
 * English name (as Open5e gives it in each background's `type: "feat"`
 * benefit, e.g. "Magic Initiate (Cleric)") -> id in FEATS_SRD. Any trailing
 * parenthesis is stripped before looking up, because our catalog does not
 * distinguish the class variant of "Magic Initiate".
 */
const FEAT_ID_BY_ENGLISH_NAME: Record<string, string> = {
  alert: "alert",
  crafter: "crafter",
  healer: "healer",
  lucky: "lucky",
  "magic initiate": "magic-initiate",
  musician: "musician",
  "savage attacker": "savage-attacker",
  skilled: "skilled",
  "tavern brawler": "tavern-brawler",
  tough: "tough",
};

/**
 * Looks up in the local catalog the feat matching the English name given
 * by the Open5e background. Returns `undefined` if there is no match (the
 * background may grant a feat outside the 10 origin feats, or the name is
 * not recognized), so the caller asks for it to be typed in by hand.
 */
export function localFeatFromEnglishName(englishName: string): FeatSrd | undefined {
  const key = englishName
    .replace(/\([^)]*\)/g, "")
    .trim()
    .toLowerCase();
  const id = FEAT_ID_BY_ENGLISH_NAME[key];
  return FEATS_SRD.find((feat) => feat.id === id);
}
