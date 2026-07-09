// Datos de razas/clases/trasfondos del SRD 5.1, embebidos localmente.
// La API de Open5e no es alcanzable desde este entorno de desarrollo (bloqueada
// por política de red), así que el wizard no depende de una llamada en vivo.
// Cuando la integración de Open5e (app/api/open5e/*) esté disponible, este
// archivo puede migrarse a un fetch real sin cambiar la forma de estos tipos.

import type { Caracteristica } from "@/lib/dnd/constantes";

export interface RasgoSrd {
  nombre: string;
  descripcion: string;
}

export interface RazaSrd {
  id: string;
  nombre: string;
  velocidad: number;
  bonificadorFijo: Partial<Record<Caracteristica, number>>;
  /** Bonificadores de característica a elección libre (ej. semielfo: +1 a dos, excluyendo cha). */
  eleccionLibre?: { cantidad: number; valor: number; excluir?: Caracteristica[] };
  idiomas: string[];
  competenciasHabilidad?: string[];
  rasgos: RasgoSrd[];
}

export interface ClaseSrd {
  id: string;
  nombre: string;
  dadoGolpe: number;
  salvacionesCompetentes: [Caracteristica, Caracteristica];
  caracteristicaConjuro?: Caracteristica;
  habilidadesDisponibles: string[];
  numHabilidadesElegibles: number;
  competenciasArmadura: string[];
  competenciasArmas: string[];
  competenciasHerramientas: string[];
  rasgosNivel1: RasgoSrd[];
}

export interface TrasfondoSrd {
  id: string;
  nombre: string;
  competenciasHabilidad: string[];
  numIdiomasElegibles: number;
  competenciasHerramientas: string[];
  rasgo: RasgoSrd;
}

export const IDIOMAS_DISPONIBLES = [
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

export const RAZAS_SRD: RazaSrd[] = [
  {
    id: "humano",
    nombre: "Humano",
    velocidad: 30,
    bonificadorFijo: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    idiomas: ["Común"],
    rasgos: [
      { nombre: "Versatilidad", descripcion: "+1 a todas las puntuaciones de característica." },
    ],
  },
  {
    id: "elfo",
    nombre: "Elfo",
    velocidad: 30,
    bonificadorFijo: { dex: 2 },
    idiomas: ["Común", "Elfico"],
    competenciasHabilidad: ["perception"],
    rasgos: [
      { nombre: "Visión en la oscuridad", descripcion: "Ves en la penumbra hasta 18 m." },
      { nombre: "Trance", descripcion: "No necesitas dormir; meditas 4 horas al día." },
      { nombre: "Sentidos agudizados", descripcion: "Competencia en Percepción." },
    ],
  },
  {
    id: "enano",
    nombre: "Enano",
    velocidad: 25,
    bonificadorFijo: { con: 2 },
    idiomas: ["Común", "Enano"],
    rasgos: [
      { nombre: "Visión en la oscuridad", descripcion: "Ves en la penumbra hasta 18 m." },
      { nombre: "Resistencia enana", descripcion: "Ventaja en salvaciones contra veneno." },
    ],
  },
  {
    id: "mediano",
    nombre: "Mediano",
    velocidad: 25,
    bonificadorFijo: { dex: 2 },
    idiomas: ["Común", "Halfling"],
    rasgos: [
      { nombre: "Suertudo", descripcion: "Repites un 1 natural en pruebas de d20." },
      { nombre: "Valiente", descripcion: "Ventaja en salvaciones contra el miedo." },
    ],
  },
  {
    id: "draconido",
    nombre: "Dracónido",
    velocidad: 30,
    bonificadorFijo: { str: 2, cha: 1 },
    idiomas: ["Común", "Dracónico"],
    rasgos: [
      { nombre: "Arma de aliento", descripcion: "Exhalas energía en un área, salvación de CON." },
      { nombre: "Resistencia al daño", descripcion: "Resistencia al tipo de daño de tu linaje." },
    ],
  },
  {
    id: "gnomo",
    nombre: "Gnomo",
    velocidad: 25,
    bonificadorFijo: { int: 2 },
    idiomas: ["Común", "Gnomo"],
    rasgos: [
      { nombre: "Visión en la oscuridad", descripcion: "Ves en la penumbra hasta 18 m." },
      { nombre: "Astucia gnoma", descripcion: "Ventaja en salvaciones de INT, SAB y CAR contra magia." },
    ],
  },
  {
    id: "semielfo",
    nombre: "Semielfo",
    velocidad: 30,
    bonificadorFijo: { cha: 2 },
    eleccionLibre: { cantidad: 2, valor: 1, excluir: ["cha"] },
    idiomas: ["Común", "Elfico"],
    rasgos: [
      { nombre: "Visión en la oscuridad", descripcion: "Ves en la penumbra hasta 18 m." },
      { nombre: "Versatilidad en habilidades", descripcion: "Competencia en dos habilidades a elección." },
    ],
  },
  {
    id: "semiorco",
    nombre: "Semiorco",
    velocidad: 30,
    bonificadorFijo: { str: 2, con: 1 },
    idiomas: ["Común", "Orco"],
    rasgos: [
      { nombre: "Visión en la oscuridad", descripcion: "Ves en la penumbra hasta 18 m." },
      { nombre: "Resistencia implacable", descripcion: "Al caer a 0 PG, quedas en 1 PG (1 vez por descanso largo)." },
    ],
  },
  {
    id: "tiefling",
    nombre: "Tiefling",
    velocidad: 30,
    bonificadorFijo: { int: 1, cha: 2 },
    idiomas: ["Común", "Infernal"],
    rasgos: [
      { nombre: "Visión en la oscuridad", descripcion: "Ves en la penumbra hasta 18 m." },
      { nombre: "Resistencia infernal", descripcion: "Resistencia al daño de fuego." },
    ],
  },
];

export const CLASES_SRD: ClaseSrd[] = [
  {
    id: "barbaro",
    nombre: "Bárbaro",
    dadoGolpe: 12,
    salvacionesCompetentes: ["str", "con"],
    habilidadesDisponibles: ["animal_handling", "athletics", "intimidation", "nature", "perception", "survival"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: ["ligera", "media", "escudos"],
    competenciasArmas: ["simples", "marciales"],
    competenciasHerramientas: [],
    rasgosNivel1: [
      { nombre: "Furia", descripcion: "Bono a daño cuerpo a cuerpo y resistencia a daño físico durante la furia." },
      { nombre: "Defensa sin armadura", descripcion: "CA = 10 + mod DES + mod CON sin llevar armadura." },
    ],
  },
  {
    id: "bardo",
    nombre: "Bardo",
    dadoGolpe: 8,
    salvacionesCompetentes: ["dex", "cha"],
    caracteristicaConjuro: "cha",
    habilidadesDisponibles: [
      "acrobatics", "animal_handling", "arcana", "athletics", "deception", "history", "insight",
      "intimidation", "investigation", "medicine", "nature", "perception", "performance",
      "persuasion", "religion", "sleight_of_hand", "stealth", "survival",
    ],
    numHabilidadesElegibles: 3,
    competenciasArmadura: ["ligera"],
    competenciasArmas: ["simples", "ballestas de mano", "espadas largas", "estoques", "espadas cortas"],
    competenciasHerramientas: ["tres instrumentos musicales a elección"],
    rasgosNivel1: [
      { nombre: "Inspiración bárdica", descripcion: "Concedes un dado de inspiración a un aliado." },
      { nombre: "Conjuros", descripcion: "Lanzas conjuros usando Carisma." },
    ],
  },
  {
    id: "clerigo",
    nombre: "Clérigo",
    dadoGolpe: 8,
    salvacionesCompetentes: ["wis", "cha"],
    caracteristicaConjuro: "wis",
    habilidadesDisponibles: ["history", "insight", "medicine", "persuasion", "religion"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: ["ligera", "media", "escudos"],
    competenciasArmas: ["simples"],
    competenciasHerramientas: [],
    rasgosNivel1: [
      { nombre: "Conjuros", descripcion: "Lanzas conjuros de clérigo usando Sabiduría." },
      { nombre: "Dominio divino", descripcion: "Otorga rasgos adicionales según el dominio elegido." },
    ],
  },
  {
    id: "druida",
    nombre: "Druida",
    dadoGolpe: 8,
    salvacionesCompetentes: ["int", "wis"],
    caracteristicaConjuro: "wis",
    habilidadesDisponibles: ["arcana", "animal_handling", "insight", "medicine", "nature", "perception", "religion", "survival"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: ["ligera (no metálica)", "media (no metálica)", "escudos (no metálicos)"],
    competenciasArmas: ["clavas", "dagas", "dardos", "jabalinas", "mazas", "bastones", "cimitarras", "hoces", "hondas", "lanzas"],
    competenciasHerramientas: ["kit de herbolario"],
    rasgosNivel1: [
      { nombre: "Druídico", descripcion: "Conoces el idioma secreto de los druidas." },
      { nombre: "Conjuros", descripcion: "Lanzas conjuros de druida usando Sabiduría." },
    ],
  },
  {
    id: "guerrero",
    nombre: "Guerrero",
    dadoGolpe: 10,
    salvacionesCompetentes: ["str", "con"],
    habilidadesDisponibles: ["acrobatics", "animal_handling", "athletics", "history", "insight", "intimidation", "perception", "survival"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: ["ligera", "media", "pesada", "escudos"],
    competenciasArmas: ["simples", "marciales"],
    competenciasHerramientas: [],
    rasgosNivel1: [
      { nombre: "Estilo de combate", descripcion: "Eliges una especialización marcial." },
      { nombre: "Aliento de combate", descripcion: "Recuperas PG como acción adicional una vez por descanso corto." },
    ],
  },
  {
    id: "monje",
    nombre: "Monje",
    dadoGolpe: 8,
    salvacionesCompetentes: ["str", "dex"],
    habilidadesDisponibles: ["acrobatics", "athletics", "history", "insight", "religion", "stealth"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: [],
    competenciasArmas: ["simples", "espadas cortas"],
    competenciasHerramientas: ["un instrumento musical o herramienta de artesano a elección"],
    rasgosNivel1: [
      { nombre: "Defensa sin armadura", descripcion: "CA = 10 + mod DES + mod SAB sin llevar armadura." },
      { nombre: "Artes marciales", descripcion: "Usas DES para ataques desarmados y armas de monje." },
    ],
  },
  {
    id: "paladin",
    nombre: "Paladín",
    dadoGolpe: 10,
    salvacionesCompetentes: ["wis", "cha"],
    caracteristicaConjuro: "cha",
    habilidadesDisponibles: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: ["ligera", "media", "pesada", "escudos"],
    competenciasArmas: ["simples", "marciales"],
    competenciasHerramientas: [],
    rasgosNivel1: [
      { nombre: "Sentidos divinos", descripcion: "Detectas presencias celestiales, infernales o no muertas." },
      { nombre: "Imposición de manos", descripcion: "Reservorio de curación igual a 5 x nivel." },
    ],
  },
  {
    id: "explorador",
    nombre: "Explorador",
    dadoGolpe: 10,
    salvacionesCompetentes: ["str", "dex"],
    caracteristicaConjuro: "wis",
    habilidadesDisponibles: ["animal_handling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"],
    numHabilidadesElegibles: 3,
    competenciasArmadura: ["ligera", "media", "escudos"],
    competenciasArmas: ["simples", "marciales"],
    competenciasHerramientas: [],
    rasgosNivel1: [
      { nombre: "Enemigo predilecto", descripcion: "Ventaja al rastrear y recordar información de un tipo de enemigo." },
      { nombre: "Explorador nato", descripcion: "Ventajas de viaje y supervivencia en un terreno favorito." },
    ],
  },
  {
    id: "picaro",
    nombre: "Pícaro",
    dadoGolpe: 8,
    salvacionesCompetentes: ["dex", "int"],
    habilidadesDisponibles: [
      "acrobatics", "athletics", "deception", "insight", "intimidation", "investigation",
      "perception", "performance", "persuasion", "sleight_of_hand", "stealth",
    ],
    numHabilidadesElegibles: 4,
    competenciasArmadura: ["ligera"],
    competenciasArmas: ["simples", "ballestas de mano", "espadas largas", "estoques", "espadas cortas"],
    competenciasHerramientas: ["herramientas de ladrón"],
    rasgosNivel1: [
      { nombre: "Pericia", descripcion: "Duplicas el bono de competencia en dos habilidades elegidas." },
      { nombre: "Ataque furtivo", descripcion: "Daño extra al atacar con ventaja o flanqueando." },
    ],
  },
  {
    id: "hechicero",
    nombre: "Hechicero",
    dadoGolpe: 6,
    salvacionesCompetentes: ["con", "cha"],
    caracteristicaConjuro: "cha",
    habilidadesDisponibles: ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: [],
    competenciasArmas: ["dagas", "dardos", "hondas", "bastones", "ballestas ligeras"],
    competenciasHerramientas: [],
    rasgosNivel1: [
      { nombre: "Conjuros", descripcion: "Lanzas conjuros de hechicero usando Carisma." },
      { nombre: "Origen mágico", descripcion: "Origen sobrenatural de tu poder (ej. linaje dracónico)." },
    ],
  },
  {
    id: "brujo",
    nombre: "Brujo",
    dadoGolpe: 8,
    salvacionesCompetentes: ["wis", "cha"],
    caracteristicaConjuro: "cha",
    habilidadesDisponibles: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: ["ligera"],
    competenciasArmas: ["simples"],
    competenciasHerramientas: [],
    rasgosNivel1: [
      { nombre: "Patrón sobrenatural", descripcion: "Un pacto con una entidad te otorga poderes." },
      { nombre: "Conjuros de pacto", descripcion: "Lanzas conjuros de brujo usando Carisma." },
    ],
  },
  {
    id: "mago",
    nombre: "Mago",
    dadoGolpe: 6,
    salvacionesCompetentes: ["int", "wis"],
    caracteristicaConjuro: "int",
    habilidadesDisponibles: ["arcana", "history", "insight", "investigation", "medicine", "religion"],
    numHabilidadesElegibles: 2,
    competenciasArmadura: [],
    competenciasArmas: ["dagas", "dardos", "hondas", "bastones", "ballestas ligeras"],
    competenciasHerramientas: [],
    rasgosNivel1: [
      { nombre: "Conjuros", descripcion: "Lanzas conjuros de mago usando Inteligencia, preparados desde tu libro." },
      { nombre: "Recuperar hechizo", descripcion: "Recuperas espacios de conjuro gastados en un descanso corto (1 vez por día)." },
    ],
  },
];

export const TRASFONDOS_SRD: TrasfondoSrd[] = [
  {
    id: "acolito",
    nombre: "Acólito",
    competenciasHabilidad: ["insight", "religion"],
    numIdiomasElegibles: 2,
    competenciasHerramientas: [],
    rasgo: {
      nombre: "Refugio de los fieles",
      descripcion: "Puedes obtener ayuda y refugio de seguidores de tu fe.",
    },
  },
  {
    id: "criminal",
    nombre: "Criminal",
    competenciasHabilidad: ["deception", "stealth"],
    numIdiomasElegibles: 0,
    competenciasHerramientas: ["un juego de herramientas de juego", "herramientas de ladrón"],
    rasgo: {
      nombre: "Contacto criminal",
      descripcion: "Tienes un contacto fiable en el submundo del crimen.",
    },
  },
  {
    id: "forastero",
    nombre: "Forastero",
    competenciasHabilidad: ["athletics", "survival"],
    numIdiomasElegibles: 1,
    competenciasHerramientas: [],
    rasgo: {
      nombre: "Vagabundo",
      descripcion: "Recuerdas la geografía de la región y encuentras comida y agua para el grupo.",
    },
  },
  {
    id: "soldado",
    nombre: "Soldado",
    competenciasHabilidad: ["athletics", "intimidation"],
    numIdiomasElegibles: 0,
    competenciasHerramientas: ["un juego de herramientas de juego", "vehículos terrestres"],
    rasgo: {
      nombre: "Rango militar",
      descripcion: "Tu rango militar es reconocido por soldados de bandos afines.",
    },
  },
  {
    id: "sabio",
    nombre: "Sabio",
    competenciasHabilidad: ["arcana", "history"],
    numIdiomasElegibles: 2,
    competenciasHerramientas: [],
    rasgo: {
      nombre: "Investigador",
      descripcion: "Sabes dónde y de quién obtener información que desconoces.",
    },
  },
];
