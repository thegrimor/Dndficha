import type { Caracteristica } from "@/lib/dnd/constantes";
import type { BonificadorTrasfondoElegido } from "@/lib/dnd/competencias";
import type { TrasfondoSrd } from "@/lib/dnd/datos-srd";
import type { EdicionDnD } from "@/lib/open5e/ediciones";

export type MetodoPuntuaciones = "array" | "manual";

/** Dote resuelta (nombre + descripción), venga del catálogo en vivo de Open5e o escrita a mano. */
export interface DoteElegida {
  nombre: string;
  descripcion: string;
}

/**
 * Dote de origen otorgada por el trasfondo (solo edición 2024): "catalogo"
 * elige una dote del catálogo en vivo de Open5e (ver /api/open5e/feats),
 * "manual" permite escribir nombre y descripción libremente para dotes que
 * no aparezcan ahí.
 */
export interface DoteOrigenElegida {
  modo: "catalogo" | "manual";
  doteElegida: DoteElegida | null;
  manualNombre: string;
  manualDescripcion: string;
}

/** Resuelve la dote de origen elegida en el wizard (catálogo o manual) a un rasgo mostrable. */
export function resolverDoteOrigen(doteOrigen: DoteOrigenElegida): DoteElegida | null {
  if (doteOrigen.modo === "manual") {
    if (!doteOrigen.manualNombre.trim()) return null;
    return { nombre: doteOrigen.manualNombre.trim(), descripcion: doteOrigen.manualDescripcion.trim() };
  }
  return doteOrigen.doteElegida;
}

/** Estado acumulado por el wizard a través de sus pasos. */
export interface DatosWizard {
  /** Edición de reglas (2014 o 2024/"5.5"); se fija una vez y queda en el personaje. */
  edicion: EdicionDnD;
  nombre: string;
  razaId: string | null;
  claseId: string | null;
  trasfondoId: string | null;
  /** Trasfondo elegido, ya normalizado desde Open5e (ver lib/dnd/trasfondos-open5e.ts). */
  trasfondoDatos: TrasfondoSrd | null;
  /** Características elegidas para el bonificador racial de elección libre (ej. semielfo). */
  eleccionesCaracteristicaRaza: Caracteristica[];
  /** Ids de habilidades (de HABILIDADES) elegidas como competencia de clase. */
  habilidadesClaseElegidas: string[];
  /** Idiomas elegidos por el trasfondo (además de los fijos de la raza). */
  idiomasTrasfondoElegidos: string[];
  /** Solo relevante en edición 2024: reparto del bonificador de característica del trasfondo. */
  bonificadorTrasfondo: BonificadorTrasfondoElegido;
  /** Solo relevante en edición 2024: dote de origen otorgada por el trasfondo. */
  doteOrigen: DoteOrigenElegida;
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
    trasfondoDatos: null,
    eleccionesCaracteristicaRaza: [],
    habilidadesClaseElegidas: [],
    idiomasTrasfondoElegidos: [],
    bonificadorTrasfondo: { modo: "reparto", mas2: null, mas1: null },
    doteOrigen: { modo: "catalogo", doteElegida: null, manualNombre: "", manualDescripcion: "" },
    metodoPuntuaciones: "array",
    puntuacionesBase: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
  };
}
