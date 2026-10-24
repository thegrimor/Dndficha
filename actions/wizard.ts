"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api } from "@/lib/api/client";
import type { WizardData, CharacterDto } from "@dndficha/rules";

/**
 * Building the sheet (score calculation, proficiencies, HP...) and validating
 * it against the SRD rules happen in the backend, in the Character Creation
 * context. The background is sent by id: the server resolves it.
 */
export async function createCharacterFromWizard(data: WizardData) {
  const { backgroundData, ...input } = data;
  const { character } = await api<{ character: CharacterDto }>("/character-creation", {
    method: "POST",
    body: { ...input, backgroundId: data.backgroundId ?? backgroundData?.id ?? null },
  });

  revalidatePath("/personajes");
  redirect(`/personajes/${character.id}`);
}
