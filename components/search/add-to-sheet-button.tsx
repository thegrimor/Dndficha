"use client";

import { useState } from "react";

import { addSpellToSheet, addItemToSheet } from "@/actions/search";
import { listCharacters } from "@/actions/characters";
import { Button } from "@/components/ui/button";
import type { Open5eSpell, Open5eMagicItem } from "@dndficha/rules";
import type { CharacterDto } from "@dndficha/rules";

type State =
  | { phase: "initial" }
  | { phase: "loading-sheets" }
  | { phase: "choose-sheet"; sheets: CharacterDto[] }
  | { phase: "saving" }
  | { phase: "success" }
  | { phase: "error"; message: string };

interface AddToSheetButtonProps {
  type: "spell" | "item";
  item: Open5eSpell | Open5eMagicItem;
  /** If it is known beforehand which sheet to add to (e.g. the user came from
   * that sheet), it is saved directly without asking or listing all sheets. */
  forcedCharacterId?: string;
}

/**
 * "Add to sheet" button for SRD search cards. If the character to add to is
 * already known (forcedCharacterId), it saves directly. Otherwise, if the
 * user has more than one character, it lets them choose with a <select>; if
 * they have only one, it adds directly; if they have none, it warns.
 */
export function AddToSheetButton({ type, item, forcedCharacterId }: AddToSheetButtonProps) {
  const [state, setState] = useState<State>({ phase: "initial" });
  const [selectedSheet, setSelectedSheet] = useState<string>("");

  async function handleInitialClick() {
    if (forcedCharacterId) {
      await save(forcedCharacterId);
      return;
    }

    setState({ phase: "loading-sheets" });
    try {
      const sheets = await listCharacters();

      if (sheets.length === 0) {
        setState({
          phase: "error",
          message: "No tienes fichas todavía. Crea un personaje primero.",
        });
        return;
      }

      if (sheets.length === 1) {
        await save(sheets[0].id);
        return;
      }

      setSelectedSheet(sheets[0].id);
      setState({ phase: "choose-sheet", sheets });
    } catch {
      setState({ phase: "error", message: "No se pudieron cargar tus fichas." });
    }
  }

  async function save(characterId: string) {
    setState({ phase: "saving" });

    const result =
      type === "spell"
        ? await addSpellToSheet(characterId, item as Open5eSpell)
        : await addItemToSheet(characterId, item as Open5eMagicItem);

    if (result.ok) {
      setState({ phase: "success" });
      setTimeout(() => setState({ phase: "initial" }), 2000);
    } else {
      setState({ phase: "error", message: result.error ?? "No se pudo añadir." });
    }
  }

  if (state.phase === "choose-sheet") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedSheet}
          onChange={(event) => setSelectedSheet(event.target.value)}
          className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {state.sheets.map((sheet) => (
            <option key={sheet.id} value={sheet.id}>
              {sheet.name}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={() => save(selectedSheet)}>
          Confirmar
        </Button>
      </div>
    );
  }

  const loading = state.phase === "loading-sheets" || state.phase === "saving";

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        size="sm"
        variant={state.phase === "success" ? "secondary" : "default"}
        disabled={loading}
        onClick={handleInitialClick}
      >
        {state.phase === "loading-sheets" && "Cargando fichas..."}
        {state.phase === "saving" && "Añadiendo..."}
        {state.phase === "success" && "Añadido ✓"}
        {(state.phase === "initial" || state.phase === "error") && "Añadir a ficha"}
      </Button>
      {state.phase === "error" && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}
    </div>
  );
}
