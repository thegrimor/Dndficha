// Data for SRD 5.1 races/classes/backgrounds, embedded locally.
// Open5e was not reachable from the development environment (blocked by
// network policy), so the wizard does not depend on a live call.
// Now that the Open5e integration (app/api/open5e/*) is available, this
// file could be migrated to a real fetch without changing the shape of these types.

import type { Ability } from "./constants";

export interface FeatureSrd {
  name: string;
  description: string;
}

export interface RaceSrd {
  id: string;
  name: string;
  speed: number;
  /**
   * Ability score bonus of the race. Only applied in the 2014 edition: in
   * 2024 the bonus comes from the background (see `BackgroundSrd.abilityBonusOptions`)
   * and these same species grant none (see `computeFinalScores`).
   */
  fixedBonus: Partial<Record<Ability, number>>;
  /** Free-choice ability bonuses (e.g. half-elf: +1 to two, excluding cha). 2014 only. */
  freeChoice?: { count: number; value: number; exclude?: Ability[] };
  languages: string[];
  skillProficiencies?: string[];
  features: FeatureSrd[];
}

export interface ClassSrd {
  id: string;
  name: string;
  hitDie: number;
  savingThrowProficiencies: [Ability, Ability];
  spellcastingAbility?: Ability;
  availableSkills: string[];
  skillChoiceCount: number;
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  level1Features: FeatureSrd[];
}

export interface BackgroundSrd {
  id: string;
  name: string;
  skillProficiencies: string[];
  languageChoiceCount: number;
  toolProficiencies: string[];
  feature: FeatureSrd;
  /**
   * The three abilities tied to the background in the 2024 edition (2024 PHB,
   * background bonus table). Only used when `edition === "2024"`: the player
   * splits +2/+1 between two of them, or +1 to all three.
   */
  abilityBonusOptions?: Ability[];
}

export const AVAILABLE_LANGUAGES = [
  "Común",
  "Elfico",
  "Enano",
  "Gigante",
  "Gnomo",
  "Goblin",
  "Halfling",
  "Orco",
  "Abisal",
  "Celestial",
  "Dracónico",
  "Infernal",
  "Primordial",
  "Silvano",
  "Infracomún",
] as const;

export const RACES_SRD: RaceSrd[] = [
  {
    id: "human",
    name: "Humano",
    speed: 30,
    fixedBonus: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    languages: ["Común"],
    features: [
      { name: "Versatilidad", description: "+1 a todas las puntuaciones de característica." },
    ],
  },
  {
    id: "elf",
    name: "Elfo",
    speed: 30,
    fixedBonus: { dex: 2 },
    languages: ["Común", "Elfico"],
    skillProficiencies: ["perception"],
    features: [
      { name: "Visión en la oscuridad", description: "Ves en la penumbra hasta 18 m." },
      { name: "Trance", description: "No necesitas dormir; meditas 4 horas al día." },
      { name: "Sentidos agudizados", description: "Competencia en Percepción." },
    ],
  },
  {
    id: "dwarf",
    name: "Enano",
    speed: 25,
    fixedBonus: { con: 2 },
    languages: ["Común", "Enano"],
    features: [
      { name: "Visión en la oscuridad", description: "Ves en la penumbra hasta 18 m." },
      { name: "Resistencia enana", description: "Ventaja en salvaciones contra veneno." },
    ],
  },
  {
    id: "halfling",
    name: "Mediano",
    speed: 25,
    fixedBonus: { dex: 2 },
    languages: ["Común", "Halfling"],
    features: [
      { name: "Suertudo", description: "Repites un 1 natural en pruebas de d20." },
      { name: "Valiente", description: "Ventaja en salvaciones contra el miedo." },
    ],
  },
  {
    id: "dragonborn",
    name: "Dracónido",
    speed: 30,
    fixedBonus: { str: 2, cha: 1 },
    languages: ["Común", "Dracónico"],
    features: [
      { name: "Arma de aliento", description: "Exhalas energía en un área, salvación de CON." },
      { name: "Resistencia al daño", description: "Resistencia al tipo de daño de tu linaje." },
    ],
  },
  {
    id: "gnome",
    name: "Gnomo",
    speed: 25,
    fixedBonus: { int: 2 },
    languages: ["Común", "Gnomo"],
    features: [
      { name: "Visión en la oscuridad", description: "Ves en la penumbra hasta 18 m." },
      { name: "Astucia gnoma", description: "Ventaja en salvaciones de INT, SAB y CAR contra magia." },
    ],
  },
  {
    id: "half-elf",
    name: "Semielfo",
    speed: 30,
    fixedBonus: { cha: 2 },
    freeChoice: { count: 2, value: 1, exclude: ["cha"] },
    languages: ["Común", "Elfico"],
    features: [
      { name: "Visión en la oscuridad", description: "Ves en la penumbra hasta 18 m." },
      { name: "Versatilidad en habilidades", description: "Competencia en dos habilidades a elección." },
    ],
  },
  {
    id: "half-orc",
    name: "Semiorco",
    speed: 30,
    fixedBonus: { str: 2, con: 1 },
    languages: ["Común", "Orco"],
    features: [
      { name: "Visión en la oscuridad", description: "Ves en la penumbra hasta 18 m." },
      { name: "Resistencia implacable", description: "Al caer a 0 PG, quedas en 1 PG (1 vez por descanso largo)." },
    ],
  },
  {
    id: "tiefling",
    name: "Tiefling",
    speed: 30,
    fixedBonus: { int: 1, cha: 2 },
    languages: ["Común", "Infernal"],
    features: [
      { name: "Visión en la oscuridad", description: "Ves en la penumbra hasta 18 m." },
      { name: "Resistencia infernal", description: "Resistencia al daño de fuego." },
    ],
  },
];

export const CLASSES_SRD: ClassSrd[] = [
  {
    id: "barbarian",
    name: "Bárbaro",
    hitDie: 12,
    savingThrowProficiencies: ["str", "con"],
    availableSkills: ["animal_handling", "athletics", "intimidation", "nature", "perception", "survival"],
    skillChoiceCount: 2,
    armorProficiencies: ["ligera", "media", "escudos"],
    weaponProficiencies: ["simples", "marciales"],
    toolProficiencies: [],
    level1Features: [
      { name: "Furia", description: "Bono a daño cuerpo a cuerpo y resistencia a daño físico durante la furia." },
      { name: "Defensa sin armadura", description: "CA = 10 + mod DES + mod CON sin llevar armadura." },
    ],
  },
  {
    id: "bard",
    name: "Bardo",
    hitDie: 8,
    savingThrowProficiencies: ["dex", "cha"],
    spellcastingAbility: "cha",
    availableSkills: [
      "acrobatics", "animal_handling", "arcana", "athletics", "deception", "history", "insight",
      "intimidation", "investigation", "medicine", "nature", "perception", "performance",
      "persuasion", "religion", "sleight_of_hand", "stealth", "survival",
    ],
    skillChoiceCount: 3,
    armorProficiencies: ["ligera"],
    weaponProficiencies: ["simples", "ballestas de mano", "espadas largas", "estoques", "espadas cortas"],
    toolProficiencies: ["tres instrumentos musicales a elección"],
    level1Features: [
      { name: "Inspiración bárdica", description: "Concedes un dado de inspiración a un aliado." },
      { name: "Conjuros", description: "Lanzas conjuros usando Carisma." },
    ],
  },
  {
    id: "cleric",
    name: "Clérigo",
    hitDie: 8,
    savingThrowProficiencies: ["wis", "cha"],
    spellcastingAbility: "wis",
    availableSkills: ["history", "insight", "medicine", "persuasion", "religion"],
    skillChoiceCount: 2,
    armorProficiencies: ["ligera", "media", "escudos"],
    weaponProficiencies: ["simples"],
    toolProficiencies: [],
    level1Features: [
      { name: "Conjuros", description: "Lanzas conjuros de clérigo usando Sabiduría." },
      { name: "Dominio divino", description: "Otorga rasgos adicionales según el dominio elegido." },
    ],
  },
  {
    id: "druid",
    name: "Druida",
    hitDie: 8,
    savingThrowProficiencies: ["int", "wis"],
    spellcastingAbility: "wis",
    availableSkills: ["arcana", "animal_handling", "insight", "medicine", "nature", "perception", "religion", "survival"],
    skillChoiceCount: 2,
    armorProficiencies: ["ligera (no metálica)", "media (no metálica)", "escudos (no metálicos)"],
    weaponProficiencies: ["clavas", "dagas", "dardos", "jabalinas", "mazas", "bastones", "cimitarras", "hoces", "hondas", "lanzas"],
    toolProficiencies: ["kit de herbolario"],
    level1Features: [
      { name: "Druídico", description: "Conoces el idioma secreto de los druidas." },
      { name: "Conjuros", description: "Lanzas conjuros de druida usando Sabiduría." },
    ],
  },
  {
    id: "fighter",
    name: "Guerrero",
    hitDie: 10,
    savingThrowProficiencies: ["str", "con"],
    availableSkills: ["acrobatics", "animal_handling", "athletics", "history", "insight", "intimidation", "perception", "survival"],
    skillChoiceCount: 2,
    armorProficiencies: ["ligera", "media", "pesada", "escudos"],
    weaponProficiencies: ["simples", "marciales"],
    toolProficiencies: [],
    level1Features: [
      { name: "Estilo de combate", description: "Eliges una especialización marcial." },
      { name: "Aliento de combate", description: "Recuperas PG como acción adicional una vez por descanso corto." },
    ],
  },
  {
    id: "monk",
    name: "Monje",
    hitDie: 8,
    savingThrowProficiencies: ["str", "dex"],
    availableSkills: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"],
    skillChoiceCount: 2,
    armorProficiencies: [],
    weaponProficiencies: ["simples", "espadas cortas"],
    toolProficiencies: ["un instrumento musical o herramienta de artesano a elección"],
    level1Features: [
      { name: "Defensa sin armadura", description: "CA = 10 + mod DES + mod SAB sin llevar armadura." },
      { name: "Artes marciales", description: "Usas DES para ataques desarmados y armas de monje." },
    ],
  },
  {
    id: "paladin",
    name: "Paladín",
    hitDie: 10,
    savingThrowProficiencies: ["wis", "cha"],
    spellcastingAbility: "cha",
    availableSkills: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"],
    skillChoiceCount: 2,
    armorProficiencies: ["ligera", "media", "pesada", "escudos"],
    weaponProficiencies: ["simples", "marciales"],
    toolProficiencies: [],
    level1Features: [
      { name: "Sentidos divinos", description: "Detectas presencias celestiales, infernales o no muertas." },
      { name: "Imposición de manos", description: "Reservorio de curación igual a 5 x nivel." },
    ],
  },
  {
    id: "ranger",
    name: "Explorador",
    hitDie: 10,
    savingThrowProficiencies: ["str", "dex"],
    spellcastingAbility: "wis",
    availableSkills: ["animal_handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"],
    skillChoiceCount: 3,
    armorProficiencies: ["ligera", "media", "escudos"],
    weaponProficiencies: ["simples", "marciales"],
    toolProficiencies: [],
    level1Features: [
      { name: "Enemigo predilecto", description: "Ventaja al rastrear y recordar información de un tipo de enemigo." },
      { name: "Explorador nato", description: "Ventajas de viaje y supervivencia en un terreno favorito." },
    ],
  },
  {
    id: "rogue",
    name: "Pícaro",
    hitDie: 8,
    savingThrowProficiencies: ["dex", "int"],
    availableSkills: [
      "acrobatics", "athletics", "deception", "insight", "intimidation", "investigation",
      "perception", "performance", "persuasion", "sleight_of_hand", "stealth",
    ],
    skillChoiceCount: 4,
    armorProficiencies: ["ligera"],
    weaponProficiencies: ["simples", "ballestas de mano", "espadas largas", "estoques", "espadas cortas"],
    toolProficiencies: ["herramientas de ladrón"],
    level1Features: [
      { name: "Pericia", description: "Duplicas el bono de competencia en dos habilidades elegidas." },
      { name: "Ataque furtivo", description: "Daño extra al atacar con ventaja o flanqueando." },
    ],
  },
  {
    id: "sorcerer",
    name: "Hechicero",
    hitDie: 6,
    savingThrowProficiencies: ["con", "cha"],
    spellcastingAbility: "cha",
    availableSkills: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"],
    skillChoiceCount: 2,
    armorProficiencies: [],
    weaponProficiencies: ["dagas", "dardos", "hondas", "bastones", "ballestas ligeras"],
    toolProficiencies: [],
    level1Features: [
      { name: "Conjuros", description: "Lanzas conjuros de hechicero usando Carisma." },
      { name: "Origen mágico", description: "Origen sobrenatural de tu poder (ej. linaje dracónico)." },
    ],
  },
  {
    id: "warlock",
    name: "Brujo",
    hitDie: 8,
    savingThrowProficiencies: ["wis", "cha"],
    spellcastingAbility: "cha",
    availableSkills: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"],
    skillChoiceCount: 2,
    armorProficiencies: ["ligera"],
    weaponProficiencies: ["simples"],
    toolProficiencies: [],
    level1Features: [
      { name: "Patrón sobrenatural", description: "Un pacto con una entidad te otorga poderes." },
      { name: "Conjuros de pacto", description: "Lanzas conjuros de brujo usando Carisma." },
    ],
  },
  {
    id: "wizard",
    name: "Mago",
    hitDie: 6,
    savingThrowProficiencies: ["int", "wis"],
    spellcastingAbility: "int",
    availableSkills: ["arcana", "history", "insight", "investigation", "medicine", "religion"],
    skillChoiceCount: 2,
    armorProficiencies: [],
    weaponProficiencies: ["dagas", "dardos", "hondas", "bastones", "ballestas ligeras"],
    toolProficiencies: [],
    level1Features: [
      { name: "Conjuros", description: "Lanzas conjuros de mago usando Inteligencia, preparados desde tu libro." },
      { name: "Recuperar hechizo", description: "Recuperas espacios de conjuro gastados en un descanso corto (1 vez por día)." },
    ],
  },
];

export const BACKGROUNDS_SRD: BackgroundSrd[] = [
  {
    id: "acolyte",
    name: "Acólito",
    skillProficiencies: ["insight", "religion"],
    languageChoiceCount: 2,
    toolProficiencies: [],
    abilityBonusOptions: ["int", "wis", "cha"],
    feature: {
      name: "Refugio de los fieles",
      description: "Puedes obtener ayuda y refugio de seguidores de tu fe.",
    },
  },
  {
    id: "criminal",
    name: "Criminal",
    skillProficiencies: ["deception", "stealth"],
    languageChoiceCount: 0,
    toolProficiencies: ["un juego de herramientas de juego", "herramientas de ladrón"],
    abilityBonusOptions: ["dex", "con", "int"],
    feature: {
      name: "Contacto criminal",
      description: "Tienes un contacto fiable en el submundo del crimen.",
    },
  },
  {
    id: "outlander",
    name: "Forastero",
    skillProficiencies: ["athletics", "survival"],
    languageChoiceCount: 1,
    toolProficiencies: [],
    abilityBonusOptions: ["dex", "con", "wis"],
    feature: {
      name: "Vagabundo",
      description: "Recuerdas la geografía de la región y encuentras comida y agua para el grupo.",
    },
  },
  {
    id: "soldier",
    name: "Soldado",
    skillProficiencies: ["athletics", "intimidation"],
    languageChoiceCount: 0,
    toolProficiencies: ["un juego de herramientas de juego", "vehículos terrestres"],
    abilityBonusOptions: ["str", "dex", "con"],
    feature: {
      name: "Rango militar",
      description: "Tu rango militar es reconocido por soldados de bandos afines.",
    },
  },
  {
    id: "sage",
    name: "Sabio",
    skillProficiencies: ["arcana", "history"],
    languageChoiceCount: 2,
    toolProficiencies: [],
    abilityBonusOptions: ["con", "int", "wis"],
    feature: {
      name: "Investigador",
      description: "Sabes dónde y de quién obtener información que desconoces.",
    },
  },
];
