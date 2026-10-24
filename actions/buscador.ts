"use server";

import { api, ApiError } from "@/lib/api/cliente";
import {
  identificadorOpen5e,
  nivelHechizo,
  nombreCategoriaObjeto,
  type Open5eHechizo,
  type Open5eObjetoMagico,
} from "@dndficha/rules";

interface ResultadoAgregar {
  ok: boolean;
  error?: string;
}

async function agregar(ruta: string, cuerpo: object): Promise<ResultadoAgregar> {
  try {
    await api(ruta, { method: "POST", body: cuerpo });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) return { ok: false, error: "No se encontró esa ficha." };
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

/**
 * Añade un hechizo del buscador SRD al libro de hechizos de una ficha,
 * guardando un snapshot completo en `datos` por si Open5e cambia o deja de
 * estar disponible más adelante. El backend rechaza duplicados.
 */
export async function agregarHechizoAFicha(personajeId: string, hechizo: Open5eHechizo): Promise<ResultadoAgregar> {
  return agregar(`/characters/${encodeURIComponent(personajeId)}/spellbook/spells`, {
    spell: {
      slug: identificadorOpen5e(hechizo),
      nombre: hechizo.name,
      nivel: nivelHechizo(hechizo),
      fuente: "open5e",
      datos: hechizo,
    },
  });
}

/** Añade un objeto (mágico) del buscador SRD al inventario de una ficha. */
export async function agregarObjetoAFicha(personajeId: string, objeto: Open5eObjetoMagico): Promise<ResultadoAgregar> {
  return agregar(`/characters/${encodeURIComponent(personajeId)}/inventory`, {
    item: {
      slug: identificadorOpen5e(objeto),
      nombre: objeto.name,
      tipo: nombreCategoriaObjeto(objeto),
      fuente: "open5e",
      datos: objeto,
    },
  });
}
