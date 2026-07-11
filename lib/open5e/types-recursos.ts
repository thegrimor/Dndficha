/**
 * Tipos "permisivos" para las formas de datos de los recursos de Open5e que
 * usa el buscador (Fase 5). El contrato real de `api.open5e.com` no se pudo
 * verificar en vivo desde este entorno (ver lib/open5e/endpoints.ts), así
 * que todos los campos que no sean `slug`/`name` son opcionales y hay que
 * usar fallbacks al renderizar. `RespuestaPaginadaOpen5e<T>` (el wrapper de
 * paginación) vive en lib/open5e/types.ts, no se duplica aquí.
 */

export interface Open5eHechizo {
  /** v1 usa `slug`, v2 usa `key`; ver identificadorOpen5e(). */
  slug?: string;
  key?: string;
  name: string;
  level?: number;
  level_int?: number;
  /** v1 lo da como string plano; v2 como objeto {name, key}. */
  school?: string | { name: string; key: string };
  desc?: string;
  higher_level?: string;
  range?: string | number;
  range_text?: string;
  components?: string;
  duration?: string;
  concentration?: boolean | string;
  ritual?: boolean | string;
  classes?: Array<{ name: string; key?: string }> | string[];
  document__title?: string;
  document?: { key: string; display_name?: string; name?: string };
  [clave: string]: unknown;
}

export interface Open5eObjetoMagico {
  /** v1 usa `slug`, v2 usa `key`; ver identificadorOpen5e(). */
  slug?: string;
  key?: string;
  name: string;
  /** v1 lo da como string plano ("Wondrous item"). */
  type?: string;
  /** v2 lo da como objeto {name, key} (ej. {name:"Armor", key:"armor"}). */
  category?: string | { name: string; key: string };
  /** v1: string plano. v2: objeto {name, key, rank}. */
  rarity?: string | { name: string; key: string; rank?: number };
  desc?: string;
  /** v1: string descriptivo. v2: boolean, con el detalle aparte en attunement_detail. */
  requires_attunement?: string | boolean;
  attunement_detail?: string | null;
  document__title?: string;
  document?: { key: string; display_name?: string; name?: string };
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

/**
 * Trasfondo tal como lo devuelve Open5e. El esquema real de v2 no se pudo
 * verificar en vivo desde este entorno (red bloqueada, ver endpoints.ts),
 * así que se aceptan tanto los nombres de campo "clásicos" de v1
 * (con guion, ej. `skill-proficiencies`) como una variante con guion bajo,
 * por si v2 los renombra. Todo opcional salvo `name`; hay que usar los
 * helpers de más abajo (con fallback) en vez de leer los campos a pelo.
 */
export interface Open5eTrasfondo {
  slug?: string;
  key?: string;
  name: string;
  desc?: string;
  "skill-proficiencies"?: string;
  skill_proficiencies?: string;
  "tool-proficiencies"?: string | null;
  tool_proficiencies?: string | null;
  languages?: string;
  feature?: string;
  "feature-desc"?: string;
  feature_desc?: string;
  document__title?: string;
  document?: { key: string; display_name?: string; name?: string };
  [clave: string]: unknown;
}

/** Primer campo de texto no vacío entre varias claves candidatas de un objeto de Open5e. */
function primerTexto(obj: Record<string, unknown>, claves: string[]): string | undefined {
  for (const clave of claves) {
    const valor = obj[clave];
    if (typeof valor === "string" && valor.trim()) return valor.trim();
  }
  return undefined;
}

/** Nombre del rasgo que otorga el trasfondo (ej. "Shelter of the Faithful"), con fallback al nombre del trasfondo. */
export function nombreRasgoTrasfondo(bg: Open5eTrasfondo): string {
  return primerTexto(bg, ["feature"]) ?? bg.name;
}

/** Descripción del rasgo del trasfondo: usa feature-desc si existe, si no la descripción general. */
export function descripcionRasgoTrasfondo(bg: Open5eTrasfondo): string {
  return primerTexto(bg, ["feature-desc", "feature_desc"]) ?? bg.desc?.trim() ?? "";
}

const ID_HABILIDAD_POR_NOMBRE_INGLES: Record<string, string> = {
  acrobatics: "acrobatics",
  "animal handling": "animal_handling",
  arcana: "arcana",
  athletics: "athletics",
  deception: "deception",
  history: "history",
  insight: "insight",
  intimidation: "intimidation",
  investigation: "investigation",
  medicine: "medicine",
  nature: "nature",
  perception: "perception",
  performance: "performance",
  persuasion: "persuasion",
  religion: "religion",
  "sleight of hand": "sleight_of_hand",
  stealth: "stealth",
  survival: "survival",
};

/**
 * Extrae ids de habilidad (mismos ids que HABILIDADES en lib/dnd/constantes)
 * de un texto libre en inglés tipo "Insight, Religion" o "Insight and Religion".
 * Los nombres que no se reconozcan se ignoran en vez de romper el wizard.
 */
export function idsHabilidadDesdeTexto(texto: string | undefined): string[] {
  if (!texto) return [];
  const partes = texto
    .split(/,|\by\b|\band\b|\/|;/i)
    .map((parte) => parte.trim().toLowerCase())
    .filter(Boolean);

  const ids: string[] = [];
  for (const parte of partes) {
    const id = ID_HABILIDAD_POR_NOMBRE_INGLES[parte];
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/** Competencias de habilidad del trasfondo, ya normalizadas a ids internos. */
export function habilidadesTrasfondo(bg: Open5eTrasfondo): string[] {
  return idsHabilidadDesdeTexto(primerTexto(bg, ["skill-proficiencies", "skill_proficiencies"]));
}

/** Competencias de herramienta del trasfondo, como texto libre (no hay taxonomía interna de herramientas). */
export function herramientasTrasfondo(bg: Open5eTrasfondo): string[] {
  const texto = primerTexto(bg, ["tool-proficiencies", "tool_proficiencies"]);
  if (!texto || /^none$/i.test(texto)) return [];
  return texto
    .split(/,|\by\b|\band\b/i)
    .map((parte) => parte.trim())
    .filter(Boolean);
}

const NUMERO_POR_PALABRA: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
};

/**
 * Número de idiomas adicionales a elegir según el texto libre del trasfondo
 * (ej. "Two of your choice"). Si no se puede interpretar, 0 (no bloquea el
 * wizard, simplemente no ofrece elección de idioma para ese trasfondo).
 */
export function idiomasElegiblesTrasfondo(bg: Open5eTrasfondo): number {
  const texto = bg.languages?.toLowerCase();
  if (!texto) return 0;
  const numeroDigito = texto.match(/\d+/);
  if (numeroDigito) return Number(numeroDigito[0]);
  for (const [palabra, valor] of Object.entries(NUMERO_POR_PALABRA)) {
    if (texto.includes(palabra)) return valor;
  }
  return 0;
}

/** Identificador estable de un recurso de Open5e, sea v1 (`slug`) o v2 (`key`). */
export function identificadorOpen5e(item: { slug?: string; key?: string; name: string }): string {
  return item.slug ?? item.key ?? item.name;
}

const NOMBRES_ESCUELA: Record<string, string> = {
  abjuration: "Abjuración",
  conjuration: "Conjuración",
  divination: "Adivinación",
  enchantment: "Encantamiento",
  evocation: "Evocación",
  illusion: "Ilusión",
  necromancy: "Nigromancia",
  transmutation: "Transmutación",
};

/** Clave normalizada de la escuela (ej. "evocation"), sea v1 (string) o v2 ({name, key}). */
export function claveEscuela(escuela?: string | { name: string; key: string }): string | undefined {
  if (!escuela) return undefined;
  return (typeof escuela === "string" ? escuela : escuela.key).toLowerCase();
}

/** Nombre legible en español de una escuela de hechizo. */
export function nombreEscuela(escuela?: string | { name: string; key: string }): string {
  const clave = claveEscuela(escuela);
  if (!clave) return "Escuela desconocida";
  return NOMBRES_ESCUELA[clave] ?? (typeof escuela === "string" ? escuela : escuela!.name);
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

/** Clave normalizada de la categoría de un objeto (v2 `category`, o v1 `type` como fallback). */
export function claveCategoriaObjeto(objeto: Open5eObjetoMagico): string | undefined {
  if (objeto.category) {
    const clave = typeof objeto.category === "string" ? objeto.category : objeto.category.key;
    return clave?.toLowerCase();
  }
  return objeto.type?.toLowerCase();
}

/** Nombre legible de la categoría de un objeto. */
export function nombreCategoriaObjeto(objeto: Open5eObjetoMagico): string {
  if (objeto.category) {
    return typeof objeto.category === "string" ? objeto.category : objeto.category.name;
  }
  return objeto.type ?? "Objeto mágico";
}

/** Nombre legible de la rareza de un objeto, sea v1 (string) o v2 ({name, key, rank}). */
export function nombreRarezaObjeto(objeto: Open5eObjetoMagico): string | undefined {
  if (!objeto.rarity) return undefined;
  return typeof objeto.rarity === "string" ? objeto.rarity : objeto.rarity.name;
}

/** Texto de sintonización a mostrar, si aplica, tolerando v1 (string) o v2 (boolean + detail). */
export function detalleSintonizacion(objeto: Open5eObjetoMagico): string | undefined {
  if (typeof objeto.requires_attunement === "string" && objeto.requires_attunement) {
    return objeto.requires_attunement;
  }
  if (objeto.requires_attunement === true) {
    return objeto.attunement_detail || "Requiere sintonización";
  }
  return undefined;
}
