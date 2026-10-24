import { notFound } from "next/navigation";

import { FullSheet } from "@/components/sheet/full-sheet";
import { api, ApiError } from "@/lib/api/client";
import type { CharacterDto } from "@dndficha/rules";

export default async function PublicSheetPage({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params;

  // Public backend route: only responds while the link is enabled.
  const character = await api<{ character: CharacterDto }>(`/public/characters/${encodeURIComponent(shareSlug)}`, {
    authenticated: false,
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
      <FullSheet character={character} readOnly />
    </main>
  );
}
