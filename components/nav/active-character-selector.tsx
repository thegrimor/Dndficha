"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { listCharacters } from "@/actions/characters";
import { useActiveCharacter } from "@/components/providers/active-character-provider";

/**
 * "Active character" selector in the app header: it lives outside each
 * page's menus, so wherever you navigate your chosen character is kept
 * (persisted in localStorage) and the spell/item search uses it
 * automatically without having to go back to "Mis personajes" every time.
 */
export function ActiveCharacterSelector() {
  const { activeCharacterId, setActiveCharacterId } = useActiveCharacter();

  const { data: characters, isLoading } = useQuery({
    queryKey: ["characters-for-selector"],
    queryFn: listCharacters,
    staleTime: 60 * 1000,
  });

  if (isLoading) return null;
  if (!characters || characters.length === 0) return null;

  const active = characters.find((p) => p.id === activeCharacterId);

  return (
    <div className="flex items-center gap-2">
      <select
        value={active ? active.id : ""}
        onChange={(event) => setActiveCharacterId(event.target.value || null)}
        className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Personaje activo"
      >
        <option value="" disabled>
          Elegir personaje activo...
        </option>
        {characters.map((character) => (
          <option key={character.id} value={character.id}>
            {character.name} (nivel {character.level})
          </option>
        ))}
      </select>
      {active && (
        <Link href={`/personajes/${active.id}`} className="text-sm hover:underline">
          Ver ficha
        </Link>
      )}
    </div>
  );
}
