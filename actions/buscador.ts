"use server";

import { actualizarPersonaje, obtenerPersonaje } from "@/actions/personajes";
import {
  identificadorOpen5e,
  nivelHechizo,
  nombreCategoriaObjeto,
  type Open5eHechizo,
  type Open5eObjetoMagico,
} from "@/lib/open5e/types-recursos";

interface ResultadoAgregar {
  ok: boolean;
  error?: string;
}

/**
 * Añade un hechizo del buscador SRD a `sheet.spells.known` de una ficha
 * existente, guardando un snapshot completo en `datos` por si Open5e cambia
 * o deja de estar disponible más adelante.
 */
export async function agregarHechizoAFicha(
  personajeId: string,
  hechizo: Open5eHechizo
): Promise<ResultadoAgregar> {
  const personaje = await obtenerPersonaje(personajeId);
  if (!personaje) {
    return { ok: false, error: "No se encontró esa ficha." };
  }

  const idHechizo = identificadorOpen5e(hechizo);
  const yaEstaba = personaje.sheet.spells.known.some((conocido) => conocido.slug === idHechizo);
  if (yaEstaba) {
    return { ok: false, error: "Ese hechizo ya está en la ficha." };
  }

  const nuevoSheet = {
    ...personaje.sheet,
    spells: {
      ...personaje.sheet.spells,
      known: [
        ...personaje.sheet.spells.known,
        {
          slug: idHechizo,
          nombre: hechizo.name,
          nivel: nivelHechizo(hechizo),
          fuente: "open5e" as const,
          datos: hechizo,
        },
      ],
    },
  };

  try {
    await actualizarPersonaje(personajeId, { sheet: nuevoSheet });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo guardar." };
  }
}

/**
 * Añade un objeto (mágico) del buscador SRD a `sheet.inventory` de una
 * ficha existente.
 */
export async function agregarObjetoAFicha(
  personajeId: string,
  objeto: Open5eObjetoMagico
): Promise<ResultadoAgregar> {
  const personaje = await obtenerPersonaje(personajeId);
  if (!personaje) {
    return { ok: false, error: "No se encontró esa ficha." };
  }

  const idObjeto = identificadorOpen5e(objeto);
  const yaEstaba = personaje.sheet.inventory.some((item) => item.slug === idObjeto);
  if (yaEstaba) {
    return { ok: false, error: "Ese objeto ya está en la ficha." };
  }

  const nuevoSheet = {
    ...personaje.sheet,
    inventory: [
      ...personaje.sheet.inventory,
      {
        slug: idObjeto,
        nombre: objeto.name,
        tipo: nombreCategoriaObjeto(objeto),
        fuente: "open5e" as const,
        datos: objeto,
      },
    ],
  };

  try {
    await actualizarPersonaje(personajeId, { sheet: nuevoSheet });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No se pudo guardar." };
  }
}
