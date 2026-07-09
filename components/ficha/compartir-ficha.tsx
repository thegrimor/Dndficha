"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { activarCompartir, desactivarCompartir } from "@/actions/compartir";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Personaje } from "@/types/personaje";

export function CompartirFicha({
  personaje,
}: {
  personaje: Pick<Personaje, "id" | "is_public" | "share_slug">;
}) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url =
    typeof window !== "undefined" && personaje.share_slug
      ? `${window.location.origin}/ficha-publica/${personaje.share_slug}`
      : personaje.share_slug
        ? `/ficha-publica/${personaje.share_slug}`
        : null;

  function activar() {
    setError(null);
    iniciarTransicion(async () => {
      try {
        await activarCompartir(personaje.id);
        router.refresh();
      } catch {
        setError("No se pudo activar el compartido. Inténtalo de nuevo.");
      }
    });
  }

  function desactivar() {
    setError(null);
    iniciarTransicion(async () => {
      try {
        await desactivarCompartir(personaje.id);
        router.refresh();
      } catch {
        setError("No se pudo desactivar el compartido. Inténtalo de nuevo.");
      }
    });
  }

  async function copiarUrl() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
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
            {personaje.is_public
              ? "Cualquiera con el enlace puede ver esta ficha en modo solo lectura."
              : "Activa el enlace público para compartir esta ficha de solo lectura."}
          </p>
        </div>
        {personaje.is_public ? (
          <Button type="button" variant="outline" size="sm" onClick={desactivar} disabled={pendiente}>
            {pendiente ? "Actualizando…" : "Dejar de compartir"}
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={activar} disabled={pendiente}>
            {pendiente ? "Activando…" : "Compartir"}
          </Button>
        )}
      </div>
      {personaje.is_public && url && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
          <label htmlFor="url-compartida" className="sr-only">
            Enlace público de la ficha
          </label>
          <Input id="url-compartida" readOnly value={url} onFocus={(e) => e.target.select()} />
          <Button type="button" variant="outline" size="sm" onClick={copiarUrl}>
            {copiado ? "¡Copiado!" : "Copiar"}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
