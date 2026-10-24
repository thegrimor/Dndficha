"use server";

import { revalidatePath } from "next/cache";

import { api } from "@/lib/api/cliente";

/** Activa el enlace público de una ficha (conserva el slug si ya existía). */
export async function activarCompartir(id: string): Promise<{ shareSlug: string }> {
  const resultado = await api<{ shareSlug: string }>(`/characters/${encodeURIComponent(id)}/share`, { method: "PUT" });
  revalidatePath(`/personajes/${id}`);
  return resultado;
}

/** Desactiva el enlace público (el slug se conserva por si se reactiva). */
export async function desactivarCompartir(id: string): Promise<void> {
  await api(`/characters/${encodeURIComponent(id)}/share`, { method: "DELETE" });
  revalidatePath(`/personajes/${id}`);
}
