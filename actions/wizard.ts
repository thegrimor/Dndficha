"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api } from "@/lib/api/cliente";
import type { DatosWizard, Personaje } from "@dndficha/rules";

/**
 * La construcción de la ficha (cálculo de puntuaciones, competencias, PG...)
 * y su validación contra las reglas del SRD ocurren en el backend, contexto
 * Character Creation. El trasfondo se envía por id: el servidor lo resuelve.
 */
export async function crearPersonajeDesdeWizard(datos: DatosWizard) {
  const { trasfondoDatos, ...solicitud } = datos;
  const { character } = await api<{ character: Personaje }>("/character-creation", {
    method: "POST",
    body: { ...solicitud, trasfondoId: datos.trasfondoId ?? trasfondoDatos?.id ?? null },
  });

  revalidatePath("/personajes");
  redirect(`/personajes/${character.id}`);
}
