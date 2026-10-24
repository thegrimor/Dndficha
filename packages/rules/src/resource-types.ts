/**
 * "Permissive" types for the shapes of the Open5e resources used by the
 * search. The real contract of `api.open5e.com` varies between v1 and v2,
 * so every field other than `slug`/`name` is optional and fallbacks must be
 * used when rendering. `Open5ePagedResponse<T>` (the pagination wrapper)
 * lives in lib/open5e/types.ts and is not duplicated here.
 */

export interface Open5eSpell {
  /** v1 uses `slug`, v2 uses `key`; see open5eIdentifier(). */
  slug?: string;
  key?: string;
  name: string;
  level?: number;
  level_int?: number;
  /** v1 gives it as a plain string; v2 as an object {name, key}. */
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
  [key: string]: unknown;
}

export interface Open5eMagicItem {
  /** v1 uses `slug`, v2 uses `key`; see open5eIdentifier(). */
  slug?: string;
  key?: string;
  name: string;
  /** v1 gives it as a plain string ("Wondrous item"). */
  type?: string;
  /** v2 gives it as an object {name, key} (e.g. {name:"Armor", key:"armor"}). */
  category?: string | { name: string; key: string };
  /** v1: plain string. v2: object {name, key, rank}. */
  rarity?: string | { name: string; key: string; rank?: number };
  desc?: string;
  /** v1: descriptive string. v2: boolean, with the detail apart in attunement_detail. */
  requires_attunement?: string | boolean;
  attunement_detail?: string | null;
  document__title?: string;
  document?: { key: string; display_name?: string; name?: string };
  [key: string]: unknown;
}

export interface Open5eWeapon {
  slug: string;
  name: string;
  category?: string;
  damage_dice?: string;
  [key: string]: unknown;
}

export interface Open5eArmor {
  slug: string;
  name: string;
  category?: string;
  ac_string?: string;
  [key: string]: unknown;
}

export interface Open5eMonster {
  slug: string;
  name: string;
  type?: string;
  size?: string;
  challenge_rating?: string | number;
  cr?: string | number;
  hit_points?: number;
  armor_class?: number;
  [key: string]: unknown;
}

/**
 * A background benefit as returned by Open5e v2 (confirmed live): each
 * background comes with a `benefits` array of typed entries, e.g.
 * `{name: "Feat", desc: "Alert", type: "feat"}` or
 * `{name: "Skill Proficiencies", desc: "Insight and Religion", type: "skill_proficiency"}`.
 * This is where the origin feat comes from (there is no choice: each
 * background gives a fixed one) and the trio of abilities for the 2024
 * bonus — not from a separate `feats` resource (that one turned out to be
 * dominated by third-party content).
 */
export interface Open5eBackgroundBenefit {
  name?: string;
  desc?: string;
  type?: string;
}

export interface Open5eBackground {
  slug?: string;
  key?: string;
  name: string;
  desc?: string;
  benefits?: Open5eBackgroundBenefit[];
  document__title?: string;
  document?: { key: string; display_name?: string; name?: string };
  [key: string]: unknown;
}

function benefitsByType(bg: Open5eBackground, type: string): Open5eBackgroundBenefit[] {
  return (bg.benefits ?? []).filter((benefit) => benefit.type === type);
}

/** Name to display for the background (always `name`; there is no separate "feature" in the 2024 SRD). */
export function backgroundFeatureName(bg: Open5eBackground): string {
  return bg.name;
}

/** Starting equipment of the background (`type: "equipment"` benefit), as free text. */
export function backgroundFeatureDescription(bg: Open5eBackground): string {
  const equipment = benefitsByType(bg, "equipment")[0]?.desc?.trim();
  return equipment ?? bg.desc?.trim() ?? "";
}

/**
 * Name of the origin feat granted by the background (`type: "feat"`
 * benefit, e.g. "Alert" or "Magic Initiate (Cleric)"), as Open5e gives it
 * in English. There is no choice: each background grants a fixed feat.
 */
export function backgroundFeatName(bg: Open5eBackground): string | undefined {
  return benefitsByType(bg, "feat")[0]?.desc?.trim() || undefined;
}

const SKILL_ID_BY_ENGLISH_NAME: Record<string, string> = {
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
 * Extracts skill ids (same ids as SKILLS in constants) from free English
 * text like "Insight, Religion" or "Insight and Religion". Names that are
 * not recognized are ignored instead of breaking the wizard.
 */
export function skillIdsFromText(text: string | undefined): string[] {
  if (!text) return [];
  const parts = text
    .split(/,|\by\b|\band\b|\/|;/i)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  const ids: string[] = [];
  for (const part of parts) {
    const id = SKILL_ID_BY_ENGLISH_NAME[part];
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/** Skill proficiencies of the background (`type: "skill_proficiency"` benefit), already normalized to internal ids. */
export function backgroundSkills(bg: Open5eBackground): string[] {
  const text = benefitsByType(bg, "skill_proficiency")[0]?.desc;
  return skillIdsFromText(text);
}

/** Tool proficiencies of the background (`type: "tool_proficiency"` benefit), as free text. */
export function backgroundTools(bg: Open5eBackground): string[] {
  const text = benefitsByType(bg, "tool_proficiency")[0]?.desc?.trim();
  if (!text || /^none$/i.test(text)) return [];
  return [text];
}

const NUMBER_BY_WORD: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
};

/**
 * Number of additional languages to choose according to the background's
 * language benefit, if any (e.g. "Two of your choice"). The 2024 SRD grants
 * no languages from backgrounds (confirmed live: no benefit of that type),
 * so this gives 0 there; it is kept in case the 2014 SRD does include it
 * with a `type` containing "language".
 */
export function backgroundLanguageChoiceCount(bg: Open5eBackground): number {
  const text = (bg.benefits ?? [])
    .find((benefit) => benefit.type?.toLowerCase().includes("language"))
    ?.desc?.toLowerCase();
  if (!text) return 0;
  const digitMatch = text.match(/\d+/);
  if (digitMatch) return Number(digitMatch[0]);
  for (const [word, value] of Object.entries(NUMBER_BY_WORD)) {
    if (text.includes(word)) return value;
  }
  return 0;
}

const ABILITY_BY_ENGLISH_NAME: Record<string, "str" | "dex" | "con" | "int" | "wis" | "cha"> = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha",
};

/**
 * Trio of abilities tied to the background's bonus (`type: "ability_score"`
 * benefit, e.g. "Intelligence, Wisdom, Charisma"), in the same order Open5e
 * gives it. If exactly 3 are not recognized, returns `undefined` (the
 * caller decides the fallback).
 */
export function backgroundBonusAbilities(
  bg: Open5eBackground
): Array<"str" | "dex" | "con" | "int" | "wis" | "cha"> | undefined {
  const text = benefitsByType(bg, "ability_score")[0]?.desc;
  if (!text) return undefined;
  const names = text
    .split(/,|\by\b|\band\b/i)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  const ids = names.map((name) => ABILITY_BY_ENGLISH_NAME[name]).filter(Boolean);
  return ids.length === 3 ? ids : undefined;
}

/** Stable identifier of an Open5e resource, whether v1 (`slug`) or v2 (`key`). */
export function open5eIdentifier(item: { slug?: string; key?: string; name: string }): string {
  return item.slug ?? item.key ?? item.name;
}

const SCHOOL_NAMES: Record<string, string> = {
  abjuration: "Abjuración",
  conjuration: "Conjuración",
  divination: "Adivinación",
  enchantment: "Encantamiento",
  evocation: "Evocación",
  illusion: "Ilusión",
  necromancy: "Nigromancia",
  transmutation: "Transmutación",
};

/** Normalized key of the school (e.g. "evocation"), whether v1 (string) or v2 ({name, key}). */
export function schoolKey(school?: string | { name: string; key: string }): string | undefined {
  if (!school) return undefined;
  return (typeof school === "string" ? school : school.key).toLowerCase();
}

/** Human-readable Spanish name of a spell school. */
export function schoolName(school?: string | { name: string; key: string }): string {
  const key = schoolKey(school);
  if (!key) return "Escuela desconocida";
  return SCHOOL_NAMES[key] ?? (typeof school === "string" ? school : school!.name);
}

/** Numeric level of a spell, tolerating the variants Open5e may send. */
export function spellLevel(spell: Open5eSpell): number {
  if (typeof spell.level_int === "number") return spell.level_int;
  if (typeof spell.level === "number") return spell.level;
  const fromText = Number(spell.level);
  return Number.isFinite(fromText) ? fromText : 0;
}

/** Human-readable level name ("Truco", "Nivel 3", ...). */
export function spellLevelName(spell: Open5eSpell): string {
  const level = spellLevel(spell);
  return level === 0 ? "Truco" : `Nivel ${level}`;
}

/** List of names of the classes that can cast the spell, however Open5e sends them. */
export function spellClasses(spell: Open5eSpell): string[] {
  if (!spell.classes) return [];
  return spell.classes.map((characterClass) => (typeof characterClass === "string" ? characterClass : characterClass.name));
}

export const SPELL_SCHOOLS: Array<{ value: string; label: string }> = [
  { value: "abjuration", label: "Abjuración" },
  { value: "conjuration", label: "Conjuración" },
  { value: "divination", label: "Adivinación" },
  { value: "enchantment", label: "Encantamiento" },
  { value: "evocation", label: "Evocación" },
  { value: "illusion", label: "Ilusión" },
  { value: "necromancy", label: "Nigromancia" },
  { value: "transmutation", label: "Transmutación" },
];

export const SPELL_LEVELS: Array<{ value: string; label: string }> = [
  { value: "0", label: "Truco" },
  ...Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: `Nivel ${i + 1}` })),
];

/** Normalized key of an item's category (v2 `category`, or v1 `type` as a fallback). */
export function itemCategoryKey(item: Open5eMagicItem): string | undefined {
  if (item.category) {
    const key = typeof item.category === "string" ? item.category : item.category.key;
    return key?.toLowerCase();
  }
  return item.type?.toLowerCase();
}

/** Human-readable name of an item's category. */
export function itemCategoryName(item: Open5eMagicItem): string {
  if (item.category) {
    return typeof item.category === "string" ? item.category : item.category.name;
  }
  return item.type ?? "Objeto mágico";
}

/** Human-readable name of an item's rarity, whether v1 (string) or v2 ({name, key, rank}). */
export function itemRarityName(item: Open5eMagicItem): string | undefined {
  if (!item.rarity) return undefined;
  return typeof item.rarity === "string" ? item.rarity : item.rarity.name;
}

/** Attunement text to display, if applicable, tolerating v1 (string) or v2 (boolean + detail). */
export function attunementDetail(item: Open5eMagicItem): string | undefined {
  if (typeof item.requires_attunement === "string" && item.requires_attunement) {
    return item.requires_attunement;
  }
  if (item.requires_attunement === true) {
    return item.attunement_detail || "Requiere sintonización";
  }
  return undefined;
}
