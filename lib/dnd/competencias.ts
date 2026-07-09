import type { Caracteristica } from "@/lib/dnd/constantes";
import type { ClaseSrd, RazaSrd, TrasfondoSrd } from "@/lib/dnd/datos-srd";
import type { FichaPersonaje } from "@/types/personaje";

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

/** Aplica el bonificador racial (fijo + elección libre) a las puntuaciones base. */
export function calcularPuntuacionesFinales(
  raza: RazaSrd,
  puntuacionesBase: Record<Caracteristica, number>,
  eleccionesCaracteristicaRaza: Caracteristica[]
): Record<Caracteristica, number> {
  const finales = { ...puntuacionesBase };
  for (const [caracteristica, bono] of Object.entries(raza.bonificadorFijo)) {
    const clave = caracteristica as Caracteristica;
    finales[clave] += bono ?? 0;
  }
  for (const caracteristica of eleccionesCaracteristicaRaza) {
    finales[caracteristica] += raza.eleccionLibre?.valor ?? 0;
  }
  return finales;
}
