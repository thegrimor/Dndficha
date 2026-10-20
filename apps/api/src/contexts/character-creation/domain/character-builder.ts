import {
  agregarCompetencias,
  ARRAY_ESTANDAR,
  CARACTERISTICAS,
  CLASES_SRD,
  RAZAS_SRD,
  calcularPuntuacionesFinales,
  claseArmadura,
  fichaVacia,
  iniciativa,
  puntosGolpeIniciales,
  type DatosWizard,
  type DoteElegida,
  type FichaPersonaje,
  type TrasfondoSrd,
} from "@dndficha/rules";

import { DomainError } from "../../../shared-kernel/domain-error";

/** Lo que el wizard envía: igual que `DatosWizard`, pero el trasfondo se resuelve en el servidor. */
export type SolicitudWizard = Omit<DatosWizard, "trasfondoDatos">;

export interface PersonajeNuevo {
  name: string;
  race: string;
  class: string;
  level: 1;
  background: string;
  edicion: FichaPersonaje["edicion"];
  sheet: FichaPersonaje;
}

const invalido = (mensaje: string, code: string) => new DomainError("validation", mensaje, code);

/**
 * Domain service: valida las elecciones del wizard contra las reglas del SRD
 * y construye la ficha de nivel 1. No hace E/S: el trasfondo y la dote ya
 * llegan resueltos por el caso de uso.
 */
export function construirPersonaje(
  solicitud: SolicitudWizard,
  trasfondo: TrasfondoSrd,
  dote: DoteElegida | null
): PersonajeNuevo {
  const nombre = solicitud.nombre.trim();
  if (!nombre) throw invalido("Falta el nombre del personaje", "name_required");

  const raza = RAZAS_SRD.find((r) => r.id === solicitud.razaId);
  const clase = CLASES_SRD.find((c) => c.id === solicitud.claseId);
  if (!raza) throw invalido("Raza no válida", "invalid_race");
  if (!clase) throw invalido("Clase no válida", "invalid_class");

  if (
    solicitud.edicion === "2014" &&
    raza.eleccionLibre &&
    new Set(solicitud.eleccionesCaracteristicaRaza).size !== raza.eleccionLibre.cantidad
  ) {
    throw invalido("Elecciones de característica de la raza incompletas", "invalid_race_choices");
  }

  const habilidades = solicitud.habilidadesClaseElegidas;
  if (
    new Set(habilidades).size !== clase.numHabilidadesElegibles ||
    habilidades.length !== clase.numHabilidadesElegibles ||
    habilidades.some((h) => !clase.habilidadesDisponibles.includes(h))
  ) {
    throw invalido("Habilidades de clase no válidas", "invalid_class_skills");
  }

  if (solicitud.idiomasTrasfondoElegidos.length !== trasfondo.numIdiomasElegibles) {
    throw invalido("Idiomas del trasfondo no válidos", "invalid_languages");
  }

  validarPuntuaciones(solicitud);

  if (solicitud.edicion === "2024") {
    const { modo, mas2, mas1 } = solicitud.bonificadorTrasfondo;
    const opciones = trasfondo.bonificadorCaracteristicas ?? [];
    if (modo === "reparto" && (!mas2 || !mas1 || mas2 === mas1 || !opciones.includes(mas2) || !opciones.includes(mas1))) {
      throw invalido("Reparto del bonificador del trasfondo no válido", "invalid_background_bonus");
    }
    if (!dote) throw invalido("Falta la dote de origen", "origin_feat_required");
  }

  const abilityScores = calcularPuntuacionesFinales({
    edicion: solicitud.edicion,
    raza,
    trasfondo,
    puntuacionesBase: solicitud.puntuacionesBase,
    eleccionesCaracteristicaRaza: solicitud.eleccionesCaracteristicaRaza,
    bonificadorTrasfondo: solicitud.bonificadorTrasfondo,
  });

  const { skills, savingThrows, languages, proficiencies } = agregarCompetencias({
    raza,
    clase,
    trasfondo,
    habilidadesClaseElegidas: habilidades,
    idiomasTrasfondoElegidos: solicitud.idiomasTrasfondoElegidos,
  });

  const pgMax = Math.max(1, puntosGolpeIniciales(clase.dadoGolpe, abilityScores.con));
  const sheet: FichaPersonaje = {
    ...fichaVacia(),
    edicion: solicitud.edicion,
    abilityScores,
    savingThrows,
    skills,
    languages,
    proficiencies,
    features: [...raza.rasgos, ...clase.rasgosNivel1, trasfondo.rasgo, ...(solicitud.edicion === "2024" && dote ? [dote] : [])],
    combat: {
      ac: claseArmadura(abilityScores.dex),
      initiative: iniciativa(abilityScores.dex),
      speed: raza.velocidad,
      hp: { current: pgMax, max: pgMax, temp: 0 },
      hitDice: `1d${clase.dadoGolpe}`,
    },
  };

  return { name: nombre, race: raza.nombre, class: clase.nombre, level: 1, background: trasfondo.nombre, edicion: solicitud.edicion, sheet };
}

function validarPuntuaciones({ metodoPuntuaciones, puntuacionesBase }: SolicitudWizard): void {
  const valores = CARACTERISTICAS.map((c) => puntuacionesBase[c]);
  if (metodoPuntuaciones === "array") {
    const esperado = [...ARRAY_ESTANDAR].sort((a, b) => a - b).join(",");
    if ([...valores].sort((a, b) => a - b).join(",") !== esperado) {
      throw invalido("Las puntuaciones deben ser una asignación del array estándar", "invalid_scores");
    }
    return;
  }
  if (!valores.every((v) => Number.isInteger(v) && v >= 1 && v <= 30)) {
    throw invalido("Las puntuaciones deben estar entre 1 y 30", "invalid_scores");
  }
}
