"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fichaVacia, type Personaje } from "@/types/personaje";

async function usuarioActualOFalla() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

export async function listarPersonajes(): Promise<Personaje[]> {
  const { supabase, user } = await usuarioActualOFalla();

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Personaje[];
}

export async function obtenerPersonaje(id: string): Promise<Personaje | null> {
  const { supabase } = await usuarioActualOFalla();

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Personaje;
}

export async function crearPersonaje(formData: FormData) {
  const { supabase, user } = await usuarioActualOFalla();

  const name = String(formData.get("name") ?? "Nuevo personaje");

  const { data, error } = await supabase
    .from("characters")
    .insert({ owner_id: user.id, name, sheet: fichaVacia() })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/personajes");
  redirect(`/personajes/${data.id}`);
}

export async function actualizarPersonaje(
  id: string,
  cambios: Partial<Pick<Personaje, "name" | "race" | "class" | "level" | "background" | "alignment" | "sheet">>
) {
  const { supabase } = await usuarioActualOFalla();

  const { error } = await supabase.from("characters").update(cambios).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/personajes/${id}`);
  revalidatePath("/personajes");
}

export async function eliminarPersonaje(id: string) {
  const { supabase } = await usuarioActualOFalla();

  const { error } = await supabase.from("characters").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/personajes");
}
