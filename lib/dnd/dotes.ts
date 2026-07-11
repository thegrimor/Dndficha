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
