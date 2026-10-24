"use server";

import { revalidatePath } from "next/cache";

import { api } from "@/lib/api/client";

/** Enables the public link of a sheet (keeps the slug if it already existed). */
export async function enableSharing(id: string): Promise<{ shareSlug: string }> {
  const result = await api<{ shareSlug: string }>(`/characters/${encodeURIComponent(id)}/share`, { method: "PUT" });
  revalidatePath(`/personajes/${id}`);
  return result;
}

/** Disables the public link (the slug is kept in case it is enabled again). */
export async function disableSharing(id: string): Promise<void> {
  await api(`/characters/${encodeURIComponent(id)}/share`, { method: "DELETE" });
  revalidatePath(`/personajes/${id}`);
}
