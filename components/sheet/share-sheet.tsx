"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { enableSharing, disableSharing } from "@/actions/sharing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CharacterDto } from "@dndficha/rules";

export function ShareSheet({
  character,
}: {
  character: Pick<CharacterDto, "id" | "is_public" | "share_slug">;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url =
    typeof window !== "undefined" && character.share_slug
      ? `${window.location.origin}/ficha-publica/${character.share_slug}`
      : character.share_slug
        ? `/ficha-publica/${character.share_slug}`
        : null;

  function enable() {
    setError(null);
    startTransition(async () => {
      try {
        await enableSharing(character.id);
        router.refresh();
      } catch {
        setError("No se pudo activar el compartido. Inténtalo de nuevo.");
      }
    });
  }

  function disable() {
    setError(null);
    startTransition(async () => {
      try {
        await disableSharing(character.id);
        router.refresh();
      } catch {
        setError("No se pudo desactivar el compartido. Inténtalo de nuevo.");
      }
    });
  }

  async function copyUrl() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar el enlace.");
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Compartir ficha</h2>
          <p className="text-sm text-muted-foreground">
            {character.is_public
              ? "Cualquiera con el enlace puede ver esta ficha en modo solo lectura."
              : "Activa el enlace público para compartir esta ficha de solo lectura."}
          </p>
        </div>
        {character.is_public ? (
          <Button type="button" variant="outline" size="sm" onClick={disable} disabled={pending}>
            {pending ? "Actualizando…" : "Dejar de compartir"}
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={enable} disabled={pending}>
            {pending ? "Activando…" : "Compartir"}
          </Button>
        )}
      </div>
      {character.is_public && url && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
          <label htmlFor="shared-url" className="sr-only">
            Enlace público de la ficha
          </label>
          <Input id="shared-url" readOnly value={url} onFocus={(e) => e.target.select()} />
          <Button type="button" variant="outline" size="sm" onClick={copyUrl}>
            {copied ? "¡Copiado!" : "Copiar"}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
