"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, ApiError } from "@/lib/api/cliente";
import type { Personaje } from "@dndficha/rules";

export async function listarPersonajes(): Promise<Personaje[]> {
  const { characters } = await api<{ characters: Personaje[] }>("/characters");
  return characters;
}

export async function obtenerPersonaje(id: string): Promise<Personaje | null> {
  try {
    const { character } = await api<{ character: Personaje }>(`/characters/${encodeURIComponent(id)}`);
    return character;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function crearPersonaje(formData: FormData) {
  const name = String(formData.get("name") ?? "Nuevo personaje");
  const { character } = await api<{ character: Personaje }>("/characters", { method: "POST", body: { name } });

  revalidatePath("/personajes");
  redirect(`/personajes/${character.id}`);
}

export async function actualizarPersonaje(
  id: string,
  cambios: Partial<Pick<Personaje, "name" | "race" | "class" | "level" | "background" | "alignment" | "sheet">>
) {
  await api(`/characters/${encodeURIComponent(id)}`, { method: "PATCH", body: cambios });

  revalidatePath(`/personajes/${id}`);
  revalidatePath("/personajes");
}

export async function eliminarPersonaje(id: string) {
  await api(`/characters/${encodeURIComponent(id)}`, { method: "DELETE" });

  revalidatePath("/personajes");
}
