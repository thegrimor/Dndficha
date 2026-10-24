"use client";

import { useEffect } from "react";

import { useActiveCharacter } from "@/components/providers/active-character-provider";

/**
 * When a character's sheet is opened, it makes that character the global
 * "active character" (the one selected in the header and used by the
 * search). It renders nothing.
 */
export function MarkActiveCharacter({ id }: { id: string }) {
  const { setActiveCharacterId } = useActiveCharacter();

  useEffect(() => {
    setActiveCharacterId(id);
  }, [id, setActiveCharacterId]);

  return null;
}
