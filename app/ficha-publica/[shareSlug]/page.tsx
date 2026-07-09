import { notFound } from "next/navigation";

import { FichaCompleta } from "@/components/ficha/ficha-completa";
import { createClient } from "@/lib/supabase/server";
import type { Personaje } from "@/types/personaje";

export default async function FichaPublicaPage({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params;
  const supabase = await createClient();

  // No hay sesión de usuario en esta ruta: la RLS ("characters: public read
  // via slug") permite la lectura solo cuando is_public=true y se conoce el
  // share_slug exacto.
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("share_slug", shareSlug)
    .eq("is_public", true)
    .single();

  if (error || !data) notFound();

  const personaje = data as Personaje;

  return (
    <main className="flex min-h-screen flex-col gap-4 p-6">
      <p className="mx-auto w-full max-w-5xl text-sm text-muted-foreground">
        Ficha compartida en modo solo lectura.
      </p>
      <FichaCompleta personaje={personaje} soloLectura />
    </main>
  );
}
