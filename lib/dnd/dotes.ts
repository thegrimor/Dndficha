// Dotes de origen (edición 2024): el trasfondo del personaje otorga una de
// estas al nivel 1, además del bonificador de característica. Catálogo
// reducido embebido localmente por el mismo motivo que datos-srd.ts (la API
// de Open5e no es alcanzable desde este entorno de desarrollo).

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

/** Resuelve la dote de origen elegida en el wizard (catálogo o manual) a un rasgo mostrable. */
export function resolverDoteOrigen(doteOrigen: {
  modo: "catalogo" | "manual";
  doteId: string | null;
  manualNombre: string;
  manualDescripcion: string;
}): { nombre: string; descripcion: string } | null {
  if (doteOrigen.modo === "manual") {
    if (!doteOrigen.manualNombre.trim()) return null;
    return { nombre: doteOrigen.manualNombre.trim(), descripcion: doteOrigen.manualDescripcion.trim() };
  }
  const dote = DOTES_SRD.find((d) => d.id === doteOrigen.doteId);
  return dote ? { nombre: dote.nombre, descripcion: dote.descripcion } : null;
}
