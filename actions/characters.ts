"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, ApiError } from "@/lib/api/client";
import type { CharacterDto } from "@dndficha/rules";

export async function listCharacters(): Promise<CharacterDto[]> {
  const { characters } = await api<{ characters: CharacterDto[] }>("/characters");
  return characters;
}

export async function getCharacter(id: string): Promise<CharacterDto | null> {
  try {
    const { character } = await api<{ character: CharacterDto }>(`/characters/${encodeURIComponent(id)}`);
    return character;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function createCharacter(formData: FormData) {
  const name = String(formData.get("name") ?? "Nuevo personaje");
  const { character } = await api<{ character: CharacterDto }>("/characters", { method: "POST", body: { name } });

  revalidatePath("/personajes");
  redirect(`/personajes/${character.id}`);
}

export async function updateCharacter(
  id: string,
  changes: Partial<Pick<CharacterDto, "name" | "race" | "class" | "level" | "background" | "alignment" | "sheet">>
) {
  await api(`/characters/${encodeURIComponent(id)}`, { method: "PATCH", body: changes });

  revalidatePath(`/personajes/${id}`);
  revalidatePath("/personajes");
}

export async function deleteCharacter(id: string) {
  await api(`/characters/${encodeURIComponent(id)}`, { method: "DELETE" });

  revalidatePath("/personajes");
}
