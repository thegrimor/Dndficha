import { CARACTERISTICAS } from "@/lib/dnd/constantes";
import type { TrasfondoSrd } from "@/lib/dnd/datos-srd";
import {
  caracteristicasBonificadorTrasfondo,
  descripcionRasgoTrasfondo,
  habilidadesTrasfondo,
  herramientasTrasfondo,
  idiomasElegiblesTrasfondo,
  nombreRasgoTrasfondo,
  type Open5eTrasfondo,
} from "@/lib/open5e/types-recursos";

/**
 * Adapta un trasfondo tal como lo devuelve Open5e a la forma interna
 * `TrasfondoSrd` que ya consume el resto del wizard (competencias.ts,
 * paso-resumen, actions/wizard.ts...), para no tener que tocar esos sitios.
 *
 * El trío de características del bonificador 2024 viene confirmado en vivo
 * dentro del propio trasfondo (beneficio `type: "ability_score"`); si por
 * lo que sea no se puede interpretar, se ofrecen las seis para que el
 * jugador reparta el +2/+1 (o +1/+1/+1) libremente en vez de bloquearse.
 */
export function trasfondoDesdeOpen5e(bg: Open5eTrasfondo): TrasfondoSrd {
  return {
    id: bg.slug ?? bg.key ?? bg.name,
    nombre: bg.name,
    competenciasHabilidad: habilidadesTrasfondo(bg),
    numIdiomasElegibles: idiomasElegiblesTrasfondo(bg),
    competenciasHerramientas: herramientasTrasfondo(bg),
    bonificadorCaracteristicas: caracteristicasBonificadorTrasfondo(bg) ?? [...CARACTERISTICAS],
    rasgo: {
      nombre: nombreRasgoTrasfondo(bg),
      descripcion: descripcionRasgoTrasfondo(bg),
    },
  };
}
