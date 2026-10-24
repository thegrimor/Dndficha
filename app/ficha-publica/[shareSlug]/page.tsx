import { notFound } from "next/navigation";

import { FichaCompleta } from "@/components/ficha/ficha-completa";
import { api, ApiError } from "@/lib/api/cliente";
import type { Personaje } from "@dndficha/rules";

export default async function FichaPublicaPage({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params;

  // Ruta pública del backend: solo responde si el enlace está activo.
  const personaje = await api<{ character: Personaje }>(`/public/characters/${encodeURIComponent(shareSlug)}`, {
    autenticada: false,
  })
    .then((r) => r.character)
    .catch((error) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    });

  return (
    <main className="flex min-h-screen flex-col gap-4 p-6">
      <p className="mx-auto w-full max-w-5xl text-sm text-muted-foreground">
        Ficha compartida en modo solo lectura.
      </p>
      <FichaCompleta personaje={personaje} soloLectura />
    </main>
  );
}
