"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

/** Tarjeta seleccionable usada para elegir raza/clase/trasfondo en el wizard. */
export function OpcionTarjeta({
  seleccionada,
  onClick,
  titulo,
  subtitulo,
  children,
}: {
  seleccionada: boolean;
  onClick: () => void;
  titulo: string;
  subtitulo?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-3 text-left text-sm transition-colors",
        seleccionada
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:bg-secondary"
      )}
    >
      <span className="font-semibold">{titulo}</span>
      {subtitulo && <span className="text-muted-foreground">{subtitulo}</span>}
      {children}
    </button>
  );
}
