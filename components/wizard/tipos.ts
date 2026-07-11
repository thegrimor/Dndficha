import type { Caracteristica } from "@/lib/dnd/constantes";
import type { EdicionDnD } from "@/lib/open5e/ediciones";

export type MetodoPuntuaciones = "array" | "manual";

/** Estado acumulado por el wizard a través de sus pasos. */
export interface DatosWizard {
  /** Edición de reglas (2014 o 2024/"5.5"); se fija una vez y queda en el personaje. */
  edicion: EdicionDnD;
  nombre: string;
  razaId: string | null;
  claseId: string | null;
  trasfondoId: string | null;
  /** Características elegidas para el bonificador racial de elección libre (ej. semielfo). */
  eleccionesCaracteristicaRaza: Caracteristica[];
  /** Ids de habilidades (de HABILIDADES) elegidas como competencia de clase. */
  habilidadesClaseElegidas: string[];
  /** Idiomas elegidos por el trasfondo (además de los fijos de la raza). */
  idiomasTrasfondoElegidos: string[];
  metodoPuntuaciones: MetodoPuntuaciones;
  /** Puntuaciones base (previas al bonificador racial), una por característica. */
  puntuacionesBase: Record<Caracteristica, number>;
}

export const ARRAY_ESTANDAR = [15, 14, 13, 12, 10, 8] as const;

export function datosWizardIniciales(): DatosWizard {
  return {
    edicion: "2014",
    nombre: "",
    razaId: null,
    claseId: null,
    trasfondoId: null,
    eleccionesCaracteristicaRaza: [],
    habilidadesClaseElegidas: [],
    idiomasTrasfondoElegidos: [],
    metodoPuntuaciones: "array",
    puntuacionesBase: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
  };
}
