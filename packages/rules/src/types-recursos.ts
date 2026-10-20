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
 * Un beneficio del trasfondo tal como lo devuelve Open5e v2 (confirmado en
 * vivo): cada trasfondo trae un array `benefits` con entradas tipadas, ej.
 * `{name: "Feat", desc: "Alert", type: "feat"}` o
 * `{name: "Skill Proficiencies", desc: "Insight and Religion", type: "skill_proficiency"}`.
 * Es aquí, dentro del propio trasfondo, donde viene la dote de origen (no
 * hay elección: cada trasfondo da una fija) y el trío de características
 * del bonificador 2024 — no en un recurso `feats` separado (ese resultó
 * estar dominado por contenido de terceros, ver conversación).
 */
export interface Open5eBeneficioTrasfondo {
  name?: string;
  desc?: string;
  type?: string;
}

export interface Open5eTrasfondo {
  slug?: string;
  key?: string;
  name: string;
  desc?: string;
  benefits?: Open5eBeneficioTrasfondo[];
  document__title?: string;
  document?: { key: string; display_name?: string; name?: string };
  [clave: string]: unknown;
}

function beneficiosPorTipo(bg: Open5eTrasfondo, tipo: string): Open5eBeneficioTrasfondo[] {
  return (bg.benefits ?? []).filter((beneficio) => beneficio.type === tipo);
}

/** Nombre a mostrar para el trasfondo (siempre `name`, no hay un "rasgo" separado en el SRD 2024). */
export function nombreRasgoTrasfondo(bg: Open5eTrasfondo): string {
  return bg.name;
}

/** Equipo inicial del trasfondo (beneficio `type: "equipment"`), como texto libre. */
export function descripcionRasgoTrasfondo(bg: Open5eTrasfondo): string {
  const equipo = beneficiosPorTipo(bg, "equipment")[0]?.desc?.trim();
  return equipo ?? bg.desc?.trim() ?? "";
}

/**
 * Nombre de la dote de origen que otorga el trasfondo (beneficio
 * `type: "feat"`, ej. "Alert" o "Magic Initiate (Cleric)"), tal como lo da
 * Open5e en inglés. No hay elección: cada trasfondo da una dote fija.
 */
export function nombreDoteTrasfondo(bg: Open5eTrasfondo): string | undefined {
  return beneficiosPorTipo(bg, "feat")[0]?.desc?.trim() || undefined;
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

/** Competencias de habilidad del trasfondo (beneficio `type: "skill_proficiency"`), ya normalizadas a ids internos. */
export function habilidadesTrasfondo(bg: Open5eTrasfondo): string[] {
  const texto = beneficiosPorTipo(bg, "skill_proficiency")[0]?.desc;
  return idsHabilidadDesdeTexto(texto);
}

/** Competencias de herramienta del trasfondo (beneficio `type: "tool_proficiency"`), como texto libre. */
export function herramientasTrasfondo(bg: Open5eTrasfondo): string[] {
  const texto = beneficiosPorTipo(bg, "tool_proficiency")[0]?.desc?.trim();
  if (!texto || /^none$/i.test(texto)) return [];
  return [texto];
}

const NUMERO_POR_PALABRA: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
};

/**
 * Número de idiomas adicionales a elegir según el beneficio de idiomas del
 * trasfondo, si existe (ej. "Two of your choice"). El SRD 2024 no otorga
 * idiomas por trasfondo (confirmado en vivo: sin beneficio de ese tipo), así
 * que esto da 0 ahí; se deja por si el SRD 2014 sí lo incluye con un
 * `type` que contenga "language".
 */
export function idiomasElegiblesTrasfondo(bg: Open5eTrasfondo): number {
  const texto = (bg.benefits ?? [])
    .find((beneficio) => beneficio.type?.toLowerCase().includes("language"))
    ?.desc?.toLowerCase();
  if (!texto) return 0;
  const numeroDigito = texto.match(/\d+/);
  if (numeroDigito) return Number(numeroDigito[0]);
  for (const [palabra, valor] of Object.entries(NUMERO_POR_PALABRA)) {
    if (texto.includes(palabra)) return valor;
  }
  return 0;
}

const CARACTERISTICA_POR_NOMBRE_INGLES: Record<string, "str" | "dex" | "con" | "int" | "wis" | "cha"> = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha",
};

/**
 * Trío de características asociado al bonificador del trasfondo (beneficio
 * `type: "ability_score"`, ej. "Intelligence, Wisdom, Charisma"), en el
 * mismo orden que da Open5e. Si no se reconocen exactamente 3, devuelve
 * `undefined` (quien llama decide el fallback).
 */
export function caracteristicasBonificadorTrasfondo(
  bg: Open5eTrasfondo
): Array<"str" | "dex" | "con" | "int" | "wis" | "cha"> | undefined {
  const texto = beneficiosPorTipo(bg, "ability_score")[0]?.desc;
  if (!texto) return undefined;
  const nombres = texto
    .split(/,|\by\b|\band\b/i)
    .map((parte) => parte.trim().toLowerCase())
    .filter(Boolean);
  const ids = nombres.map((nombre) => CARACTERISTICA_POR_NOMBRE_INGLES[nombre]).filter(Boolean);
  return ids.length === 3 ? ids : undefined;
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
