"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const CLAVE_ALMACENAMIENTO = "dndficha:personaje-activo";

type Escuchador = () => void;
const escuchadores = new Set<Escuchador>();

function suscribirse(escuchador: Escuchador) {
  escuchadores.add(escuchador);
  return () => escuchadores.delete(escuchador);
}

function obtenerSnapshot(): string | null {
  return localStorage.getItem(CLAVE_ALMACENAMIENTO);
}

function obtenerSnapshotServidor(): string | null {
  return null;
}

function guardarPersonajeActivo(id: string | null) {
  if (id) localStorage.setItem(CLAVE_ALMACENAMIENTO, id);
  else localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  for (const escuchador of escuchadores) escuchador();
}

interface PersonajeActivoContextValor {
  /** null mientras no se ha leído localStorage todavía (SSR), o si no hay ninguno elegido. */
  personajeActivoId: string | null;
  setPersonajeActivoId: (id: string | null) => void;
}

const PersonajeActivoContext = createContext<PersonajeActivoContextValor | null>(null);

/**
 * Guarda qué personaje está "abierto" en localStorage para que la selección
 * sobreviva a cerrar el navegador (la idea es tener un pj abierto semanas o
 * meses sin tener que volver a elegirlo cada vez).
 */
export function PersonajeActivoProvider({ children }: { children: React.ReactNode }) {
  const personajeActivoId = useSyncExternalStore(suscribirse, obtenerSnapshot, obtenerSnapshotServidor);

  return (
    <PersonajeActivoContext.Provider
      value={{ personajeActivoId, setPersonajeActivoId: guardarPersonajeActivo }}
    >
      {children}
    </PersonajeActivoContext.Provider>
  );
}

export function usePersonajeActivo(): PersonajeActivoContextValor {
  const contexto = useContext(PersonajeActivoContext);
  if (!contexto) throw new Error("usePersonajeActivo debe usarse dentro de <PersonajeActivoProvider>");
  return contexto;
}
