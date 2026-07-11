"use client";

import { useEffect } from "react";

import { usePersonajeActivo } from "@/components/providers/personaje-activo-provider";

/**
 * Al abrir la ficha de un personaje, lo convierte en el "personaje activo"
 * global (el que queda seleccionado en la cabecera y el que usa el
 * buscador). No renderiza nada.
 */
export function MarcarPersonajeActivo({ id }: { id: string }) {
  const { setPersonajeActivoId } = usePersonajeActivo();

  useEffect(() => {
    setPersonajeActivoId(id);
  }, [id, setPersonajeActivoId]);

  return null;
}
