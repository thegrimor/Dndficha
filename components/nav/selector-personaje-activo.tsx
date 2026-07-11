"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { listarPersonajes } from "@/actions/personajes";
import { usePersonajeActivo } from "@/components/providers/personaje-activo-provider";

/**
 * Selector de "personaje activo" en la cabecera de la app: vive fuera de
 * los menús de cada página, así que da igual por dónde navegues, tu
 * personaje elegido se mantiene (persistido en localStorage) y el buscador
 * de hechizos/objetos lo usa automáticamente sin tener que volver a
 * "Mis personajes" cada vez.
 */
export function SelectorPersonajeActivo() {
  const { personajeActivoId, setPersonajeActivoId } = usePersonajeActivo();

  const { data: personajes, isLoading } = useQuery({
    queryKey: ["personajes-para-selector"],
    queryFn: listarPersonajes,
    staleTime: 60 * 1000,
  });

  if (isLoading) return null;
  if (!personajes || personajes.length === 0) return null;

  const activo = personajes.find((p) => p.id === personajeActivoId);

  return (
    <div className="flex items-center gap-2">
      <select
        value={activo ? activo.id : ""}
        onChange={(evento) => setPersonajeActivoId(evento.target.value || null)}
        className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Personaje activo"
      >
        <option value="" disabled>
          Elegir personaje activo...
        </option>
        {personajes.map((personaje) => (
          <option key={personaje.id} value={personaje.id}>
            {personaje.name} (nivel {personaje.level})
          </option>
        ))}
      </select>
      {activo && (
        <Link href={`/personajes/${activo.id}`} className="text-sm hover:underline">
          Ver ficha
        </Link>
      )}
    </div>
  );
}
