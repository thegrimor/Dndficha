"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function usuarioActualOFalla() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

/**
 * Activa el compartido público de una ficha: genera un share_slug si no
 * existe todavía y marca is_public=true. actualizarPersonaje() (en
 * actions/personajes.ts) no permite tocar estas dos columnas, así que aquí
 * hacemos el update directo contra Supabase siguiendo el mismo patrón.
 */
export async function activarCompartir(id: string): Promise<{ shareSlug: string }> {
  const { supabase, user } = await usuarioActualOFalla();

  const { data: actual, error: errorLectura } = await supabase
    .from("characters")
    .select("share_slug")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (errorLectura) throw new Error(errorLectura.message);

  const shareSlug: string = actual?.share_slug ?? crypto.randomUUID().slice(0, 8);

  const { error } = await supabase
    .from("characters")
    .update({ is_public: true, share_slug: shareSlug })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/personajes/${id}`);

  return { shareSlug };
}

/** Desactiva el compartido público (conserva el share_slug por si se reactiva). */
export async function desactivarCompartir(id: string): Promise<void> {
  const { supabase, user } = await usuarioActualOFalla();

  const { error } = await supabase
    .from("characters")
    .update({ is_public: false })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/personajes/${id}`);
}
