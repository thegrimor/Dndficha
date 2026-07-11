"use client";

import Link from "next/link";

import { usePersonajeActivo } from "@/components/providers/personaje-activo-provider";
import type { Personaje } from "@/types/personaje";

interface SelectorPersonajeActivoProps {
  personajes: Pick<Personaje, "id" | "name" | "level">[];
}

/**
 * Selector de "personaje activo" en la cabecera de la app: vive fuera de
 * los menús de cada página, así que da igual por dónde navegues, tu
 * personaje elegido se mantiene (persistido en localStorage) y el buscador
 * de hechizos/objetos lo usa automáticamente sin tener que volver a
 * "Mis personajes" cada vez.
 *
 * Recibe la lista de personajes ya cargada desde el layout (server
 * component): así no hace falta volver a pedirla desde el cliente en cada
 * página, lo que evita llamar a una Server Action protegida fuera de una
 * acción de usuario.
 */
export function SelectorPersonajeActivo({ personajes }: SelectorPersonajeActivoProps) {
  const { personajeActivoId, setPersonajeActivoId } = usePersonajeActivo();

  if (personajes.length === 0) return null;

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
