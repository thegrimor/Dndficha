"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getCharacter } from "@/actions/characters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SpellCard } from "@/components/search/spell-card";
import { useActiveCharacter } from "@/components/providers/active-character-provider";
import {
  Open5eCatalogLoading,
  Open5eCatalogError,
  Open5eNoResults,
} from "@/components/search/open5e-status";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { DND_EDITIONS, type DndEdition } from "@dndficha/rules";
import {
  schoolKey,
  SPELL_SCHOOLS,
  open5eIdentifier,
  SPELL_LEVELS,
  spellLevel,
  type Open5eSpell,
} from "@dndficha/rules";

const VISIBLE_BATCH_SIZE = 24;
const CLIENT_TIMEOUT_MS = 15000;

async function fetchSpellCatalog(edition: DndEdition): Promise<Open5eSpell[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const response = await fetch(`/api/open5e/spells?edition=${edition}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("open5e_unavailable");
    }
    const data = (await response.json()) as { results: Open5eSpell[] };
    return data.results;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function SpellSearch() {
  // If we come from a character's sheet (`?personaje=<id>`), the
  // edition and the target of "Add to sheet" are fixed by that sheet.
  // Otherwise we use the active character (chosen in the header) so we
  // do not always have to go through the sheet first.
  const searchParams = useSearchParams();
  const { activeCharacterId } = useActiveCharacter();
  const characterId = searchParams.get("personaje") ?? activeCharacterId ?? undefined;

  const { data: character } = useQuery({
    queryKey: ["character-for-search", characterId],
    queryFn: () => getCharacter(characterId as string),
    enabled: Boolean(characterId),
    staleTime: 5 * 60 * 1000,
  });

  const [manualEdition, setManualEdition] = useState<DndEdition>("2014");
  const edition = characterId ? character?.sheet.edition : manualEdition;

  // Maximum spell level the character can cast according to their spell
  // slots (if the active character has none defined, there is no cap).
  const maxCharacterLevel = useMemo(() => {
    const slots = character?.sheet.spells.slots;
    if (!slots) return undefined;
    const levelsWithSlots = Object.entries(slots)
      .filter(([, slot]) => slot.total > 0)
      .map(([level]) => Number(level));
    return levelsWithSlots.length > 0 ? Math.max(...levelsWithSlots) : undefined;
  }, [character]);

  const [text, setText] = useState("");
  const [level, setLevel] = useState("");
  const [school, setSchool] = useState("");
  const [castableOnly, setCastableOnly] = useState(true);
  const [visible, setVisible] = useState(VISIBLE_BATCH_SIZE);
  const debouncedText = useDebounce(text, 200);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["open5e", "spells", "full", edition],
    queryFn: () => fetchSpellCatalog(edition as DndEdition),
    enabled: Boolean(edition),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  // The full catalog is fetched once per edition; filtering is 100% on
  // the client because Open5e does not always honor the
  // search/level/school parameters.
  const applyLevelCap = castableOnly && maxCharacterLevel !== undefined;

  const filtered = useMemo(() => {
    if (!data) return [];
    const normalizedText = debouncedText.trim().toLowerCase();

    return data.filter((spell) => {
      if (normalizedText && !spell.name.toLowerCase().includes(normalizedText)) {
        return false;
      }
      if (level !== "" && spellLevel(spell) !== Number(level)) return false;
      if (school && schoolKey(spell.school) !== school) return false;
      if (applyLevelCap && spellLevel(spell) > (maxCharacterLevel as number)) return false;
      return true;
    });
  }, [data, debouncedText, level, school, applyLevelCap, maxCharacterLevel]);

  // Resets the visible batch when the filters change (the "adjust
  // state during render" pattern) instead of an effect, to avoid
  // triggering an extra cascading render.
  const currentFilter = `${edition}|${debouncedText}|${level}|${school}|${applyLevelCap}`;
  const [previousFilter, setPreviousFilter] = useState(currentFilter);
  if (currentFilter !== previousFilter) {
    setPreviousFilter(currentFilter);
    setVisible(VISIBLE_BATCH_SIZE);
  }

  const results = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  return (
    <div className="flex flex-col gap-6">
      {characterId && (
        <p className="text-sm text-muted-foreground">
          Añadiendo hechizos a <span className="font-medium text-foreground">{character?.name ?? "…"}</span> ·{" "}
          {DND_EDITIONS.find((e) => e.value === edition)?.label ?? "Cargando edición..."}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {!characterId && (
          <select
            value={manualEdition}
            onChange={(event) => setManualEdition(event.target.value as DndEdition)}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {DND_EDITIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        <Input
          placeholder="Buscar hechizo por nombre..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={level}
          onChange={(event) => setLevel(event.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todos los niveles</option>
          {SPELL_LEVELS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={school}
          onChange={(event) => setSchool(event.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todas las escuelas</option>
          {SPELL_SCHOOLS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {maxCharacterLevel !== undefined && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={castableOnly}
              onChange={(event) => setCastableOnly(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Solo los que {character?.name ?? "el personaje"} puede lanzar (hasta nivel {maxCharacterLevel})
          </label>
        )}
      </div>

      {isError && <Open5eCatalogError onRetry={() => refetch()} />}
      {!isError && isLoading && <Open5eCatalogLoading />}
      {!isError && !isLoading && filtered.length === 0 && <Open5eNoResults />}

      {!isError && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((spell) => (
              <SpellCard
                key={open5eIdentifier(spell)}
                spell={spell}
                forcedCharacterId={characterId}
              />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisible((v) => v + VISIBLE_BATCH_SIZE)}
              >
                Cargar más
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
