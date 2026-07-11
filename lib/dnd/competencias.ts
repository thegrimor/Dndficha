import type { Caracteristica } from "@/lib/dnd/constantes";
import type { ClaseSrd, RazaSrd, TrasfondoSrd } from "@/lib/dnd/datos-srd";
import type { EdicionDnD } from "@/lib/open5e/ediciones";
import type { FichaPersonaje } from "@/types/personaje";

export type ModoBonificadorTrasfondo = "reparto" | "parejo";

/**
 * Elección del jugador para el bonificador de característica del trasfondo
 * en edición 2024: "reparto" da +2 a una característica y +1 a otra (de las
 * tres asociadas al trasfondo); "parejo" da +1 a las tres.
 */
export interface BonificadorTrasfondoElegido {
  modo: ModoBonificadorTrasfondo;
  mas2: Caracteristica | null;
  mas1: Caracteristica | null;
}

export interface CompetenciasAgregadas {
  skills: FichaPersonaje["skills"];
  savingThrows: FichaPersonaje["savingThrows"];
  languages: string[];
  proficiencies: FichaPersonaje["proficiencies"];
}

/**
 * Agrega las competencias de habilidad/salvación/idiomas otorgadas por
 * raza + clase + trasfondo en la forma que espera FichaPersonaje.
 */
export function agregarCompetencias(datos: {
  raza: RazaSrd;
  clase: ClaseSrd;
  trasfondo: TrasfondoSrd;
  habilidadesClaseElegidas: string[];
  idiomasTrasfondoElegidos: string[];
}): CompetenciasAgregadas {
  const { raza, clase, trasfondo, habilidadesClaseElegidas, idiomasTrasfondoElegidos } = datos;

  const idsHabilidadCompetente = new Set([
    ...(raza.competenciasHabilidad ?? []),
    ...habilidadesClaseElegidas,
    ...trasfondo.competenciasHabilidad,
  ]);

  const skills: FichaPersonaje["skills"] = {};
  for (const id of idsHabilidadCompetente) {
    skills[id] = { proficient: true };
  }

  const savingThrows: FichaPersonaje["savingThrows"] = {};
  for (const caracteristica of clase.salvacionesCompetentes as Caracteristica[]) {
    savingThrows[caracteristica] = { proficient: true };
  }

  const languages = Array.from(new Set([...raza.idiomas, ...idiomasTrasfondoElegidos]));

  const proficiencies: FichaPersonaje["proficiencies"] = {
    armor: [...clase.competenciasArmadura],
    weapons: [...clase.competenciasArmas],
    tools: Array.from(new Set([...clase.competenciasHerramientas, ...trasfondo.competenciasHerramientas])),
  };

  return { skills, savingThrows, languages, proficiencies };
}

/**
 * Aplica el bonificador de característica a las puntuaciones base. La fuente
 * del bonificador depende de la edición: en 2014 lo da la raza (fijo +
 * elección libre); en 2024 lo da el trasfondo (repartido o parejo entre sus
 * tres características asociadas).
 */
export function calcularPuntuacionesFinales(datos: {
  edicion: EdicionDnD;
  raza: RazaSrd;
  trasfondo: TrasfondoSrd;
  puntuacionesBase: Record<Caracteristica, number>;
  eleccionesCaracteristicaRaza: Caracteristica[];
  bonificadorTrasfondo: BonificadorTrasfondoElegido;
}): Record<Caracteristica, number> {
  const finales = { ...datos.puntuacionesBase };

  if (datos.edicion === "2014") {
    for (const [caracteristica, bono] of Object.entries(datos.raza.bonificadorFijo)) {
      const clave = caracteristica as Caracteristica;
      finales[clave] += bono ?? 0;
    }
    for (const caracteristica of datos.eleccionesCaracteristicaRaza) {
      finales[caracteristica] += datos.raza.eleccionLibre?.valor ?? 0;
    }
    return finales;
  }

  const opciones = datos.trasfondo.bonificadorCaracteristicas ?? [];
  if (datos.bonificadorTrasfondo.modo === "parejo") {
    for (const caracteristica of opciones) {
      finales[caracteristica] += 1;
    }
  } else {
    if (datos.bonificadorTrasfondo.mas2) finales[datos.bonificadorTrasfondo.mas2] += 2;
    if (datos.bonificadorTrasfondo.mas1) finales[datos.bonificadorTrasfondo.mas1] += 1;
  }
  return finales;
}
