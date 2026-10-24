"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const STORAGE_KEY = "dndficha:personaje-activo";

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function saveActiveCharacter(id: string | null) {
  if (id) localStorage.setItem(STORAGE_KEY, id);
  else localStorage.removeItem(STORAGE_KEY);
  for (const listener of listeners) listener();
}

interface ActiveCharacterContextValue {
  /** null until localStorage has been read (SSR), or if none is selected. */
  activeCharacterId: string | null;
  setActiveCharacterId: (id: string | null) => void;
}

const ActiveCharacterContext = createContext<ActiveCharacterContextValue | null>(null);

/**
 * Stores which character is "open" in localStorage so the selection
 * survives closing the browser (the idea is to keep a character open for
 * weeks or months without having to choose it again every time).
 */
export function ActiveCharacterProvider({ children }: { children: React.ReactNode }) {
  const activeCharacterId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <ActiveCharacterContext.Provider
      value={{ activeCharacterId, setActiveCharacterId: saveActiveCharacter }}
    >
      {children}
    </ActiveCharacterContext.Provider>
  );
}

export function useActiveCharacter(): ActiveCharacterContextValue {
  const context = useContext(ActiveCharacterContext);
  if (!context) throw new Error("useActiveCharacter must be used within <ActiveCharacterProvider>");
  return context;
}
