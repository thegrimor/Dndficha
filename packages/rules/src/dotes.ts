// Dotes de origen (edición 2024): el trasfondo del personaje otorga una de
// estas al nivel 1, además del bonificador de característica. Catálogo
// local curado: se comprobó en vivo que Open5e no tiene un catálogo real de
// dotes oficiales de D&D (ni 2014 ni 2024) — su recurso `feats` está
// dominado por contenido de terceros (A5E, Tome of Heroes) y solo contiene
// UNA dote SRD oficial en toda la base de datos, así que no sirve como
// fuente en vivo (ver conversación del 2026-07-11).

export interface DoteSrd {
  id: string;
  nombre: string;
  descripcion: string;
}

export const DOTES_SRD: DoteSrd[] = [
  {
    id: "alerta",
    nombre: "Alerta",
    descripcion: "Tienes +5 a la iniciativa y no puedes ser sorprendido mientras estés consciente.",
  },
  {
    id: "artesano",
    nombre: "Artesano",
    descripcion: "Ganas competencia con tres herramientas de artesano y fabricas objetos no mágicos más rápido.",
  },
  {
    id: "sanador",
    nombre: "Sanador",
    descripcion: "Con un kit de sanador, estabilizas a una criatura y le devuelves puntos de golpe adicionales.",
  },
  {
    id: "afortunado",
    nombre: "Afortunado",
    descripcion:
      "Tienes puntos de suerte que puedes gastar para obtener ventaja en una tirada o imponer desventaja a un ataque contra ti.",
  },
  {
    id: "iniciado-en-magia",
    nombre: "Iniciado en magia",
    descripcion:
      "Aprendes dos trucos y un conjuro de nivel 1 de una lista a elegir, que puedes lanzar una vez por descanso largo sin gastar espacio.",
  },
  {
    id: "musico",
    nombre: "Músico",
    descripcion: "Con un instrumento musical, puedes inspirar a un aliado otorgándole un dado de inspiración.",
  },
  {
    id: "atacante-salvaje",
    nombre: "Atacante salvaje",
    descripcion:
      "Al golpear con un arma cuerpo a cuerpo, tiras el dado de daño dos veces y te quedas con el mejor resultado.",
  },
  {
    id: "habilidoso",
    nombre: "Habilidoso",
    descripcion: "Ganas competencia en tres habilidades a tu elección.",
  },
  {
    id: "camorrista-de-taberna",
    nombre: "Camorrista de taberna",
    descripcion:
      "Tus golpes improvisados y ataques desarmados causan más daño y pueden derribar a la criatura golpeada.",
  },
  {
    id: "duro",
    nombre: "Duro",
    descripcion: "Tus puntos de golpe máximos aumentan en 2 por cada nivel que tengas.",
  },
];

/**
 * Nombre en inglés (tal como lo da Open5e en el beneficio `type: "feat"` de
 * cada trasfondo, ej. "Magic Initiate (Cleric)") -> id de DOTES_SRD. Se
 * quita cualquier paréntesis final antes de buscar, porque nuestro
 * catálogo no distingue la variante de clase de "Magic Initiate".
 */
const ID_DOTE_POR_NOMBRE_INGLES: Record<string, string> = {
  alert: "alerta",
  crafter: "artesano",
  healer: "sanador",
  lucky: "afortunado",
  "magic initiate": "iniciado-en-magia",
  musician: "musico",
  "savage attacker": "atacante-salvaje",
  skilled: "habilidoso",
  "tavern brawler": "camorrista-de-taberna",
  tough: "duro",
};

/**
 * Busca en el catálogo local la dote que corresponde al nombre en inglés
 * que da el trasfondo de Open5e. Devuelve `undefined` si no hay match (el
 * trasfondo puede dar una dote fuera de las 10 de origen, o el nombre no
 * se reconoce), para que quien llame pida escribirla a mano.
 */
export function doteLocalDesdeNombreIngles(nombreIngles: string): DoteSrd | undefined {
  const clave = nombreIngles
    .replace(/\([^)]*\)/g, "")
    .trim()
    .toLowerCase();
  const id = ID_DOTE_POR_NOMBRE_INGLES[clave];
  return DOTES_SRD.find((dote) => dote.id === id);
}
