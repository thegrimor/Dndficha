/**
 * Tipos "permisivos" para las formas de datos de los recursos de Open5e que
 * usa el buscador (Fase 5). El contrato real de `api.open5e.com` no se pudo
 * verificar en vivo desde este entorno (ver lib/open5e/endpoints.ts), así
 * que todos los campos que no sean `slug`/`name` son opcionales y hay que
 * usar fallbacks al renderizar. `RespuestaPaginadaOpen5e<T>` (el wrapper de
 * paginación) vive en lib/open5e/types.ts, no se duplica aquí.
 */

export interface Open5eHechizo {
  slug: string;
  name: string;
  level?: number;
  level_int?: number;
  school?: string;
  desc?: string;
  higher_level?: string;
  range?: string;
  components?: string;
  duration?: string;
  concentration?: boolean | string;
  ritual?: boolean | string;
  classes?: Array<{ name: string }> | string[];
  document__title?: string;
  [clave: string]: unknown;
}

export interface Open5eObjetoMagico {
  slug: string;
  name: string;
  type?: string;
  rarity?: string;
  desc?: string;
  requires_attunement?: string;
  document__title?: string;
  [clave: string]: unknown;
}

export interface Open5eArma {
  slug: string;
  name: string;
  category?: string;
  damage_dice?: string;
  [clave: string]: unknown;
}

export interface Open5eArmadura {
  slug: string;
  name: string;
  category?: string;
  ac_string?: string;
  [clave: string]: unknown;
}

export interface Open5eMonstruo {
  slug: string;
  name: string;
  type?: string;
  size?: string;
  challenge_rating?: string | number;
  cr?: string | number;
  hit_points?: number;
  armor_class?: number;
  [clave: string]: unknown;
}

/** Nivel numérico de un hechizo, tolerando las variantes que puede mandar Open5e. */
export function nivelHechizo(hechizo: Open5eHechizo): number {
  if (typeof hechizo.level_int === "number") return hechizo.level_int;
  if (typeof hechizo.level === "number") return hechizo.level;
  const desdeTexto = Number(hechizo.level);
  return Number.isFinite(desdeTexto) ? desdeTexto : 0;
}

/** Nombre de nivel legible ("Truco", "Nivel 3", ...). */
export function nombreNivelHechizo(hechizo: Open5eHechizo): string {
  const nivel = nivelHechizo(hechizo);
  return nivel === 0 ? "Truco" : `Nivel ${nivel}`;
}

/** Lista de nombres de clases que pueden lanzar el hechizo, sea cual sea la forma en que Open5e las mande. */
export function clasesHechizo(hechizo: Open5eHechizo): string[] {
  if (!hechizo.classes) return [];
  return hechizo.classes.map((clase) => (typeof clase === "string" ? clase : clase.name));
}

export const ESCUELAS_HECHIZO: Array<{ value: string; label: string }> = [
  { value: "abjuration", label: "Abjuración" },
  { value: "conjuration", label: "Conjuración" },
  { value: "divination", label: "Adivinación" },
  { value: "enchantment", label: "Encantamiento" },
  { value: "evocation", label: "Evocación" },
  { value: "illusion", label: "Ilusión" },
  { value: "necromancy", label: "Nigromancia" },
  { value: "transmutation", label: "Transmutación" },
];

export const NIVELES_HECHIZO: Array<{ value: string; label: string }> = [
  { value: "0", label: "Truco" },
  ...Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: `Nivel ${i + 1}` })),
];
