import { CARACTERISTICAS } from "@/lib/dnd/constantes";
import type { TrasfondoSrd } from "@/lib/dnd/datos-srd";
import {
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
 * Open5e no expone (o no se pudo confirmar en vivo, ver endpoints.ts) qué
 * tres características asocia el PHB 2024 a cada trasfondo para su
 * bonificador, así que aquí se ofrecen las seis: el jugador reparte el
 * +2/+1 (o +1/+1/+1) entre las que quiera en vez de estar limitado a un
 * trío fijo que no podemos obtener de la API con garantías.
 */
export function trasfondoDesdeOpen5e(bg: Open5eTrasfondo): TrasfondoSrd {
  return {
    id: bg.slug ?? bg.key ?? bg.name,
    nombre: bg.name,
    competenciasHabilidad: habilidadesTrasfondo(bg),
    numIdiomasElegibles: idiomasElegiblesTrasfondo(bg),
    competenciasHerramientas: herramientasTrasfondo(bg),
    bonificadorCaracteristicas: [...CARACTERISTICAS],
    rasgo: {
      nombre: nombreRasgoTrasfondo(bg),
      descripcion: descripcionRasgoTrasfondo(bg),
    },
  };
}
