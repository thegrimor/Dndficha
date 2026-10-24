"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getCharacter } from "@/actions/characters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/search/item-card";
import { useActiveCharacter } from "@/components/providers/active-character-provider";
import {
  Open5eCatalogLoading,
  Open5eCatalogError,
  Open5eNoResults,
} from "@/components/search/open5e-status";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { DND_EDITIONS, type DndEdition } from "@dndficha/rules";
import {
  itemCategoryKey,
  open5eIdentifier,
  itemCategoryName,
  type Open5eMagicItem,
} from "@dndficha/rules";

const VISIBLE_BATCH_SIZE = 24;
const CLIENT_TIMEOUT_MS = 15000;

async function fetchItemCatalog(edition: DndEdition): Promise<Open5eMagicItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const response = await fetch(`/api/open5e/magicitems?edition=${edition}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("open5e_unavailable");
    }
    const data = (await response.json()) as { results: Open5eMagicItem[] };
    return data.results;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function ItemSearch() {
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

  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [visible, setVisible] = useState(VISIBLE_BATCH_SIZE);
  const debouncedText = useDebounce(text, 200);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["open5e", "magicitems", "full", edition],
    queryFn: () => fetchItemCatalog(edition as DndEdition),
    enabled: Boolean(edition),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  // The filter categories come from the data already loaded (not from a
  // hand-guessed list), because the exact values of "category" are only
  // known by looking at the real Open5e response.
  const categories = useMemo(() => {
    if (!data) return [];
    const views = new Map<string, string>();
    for (const item of data) {
      const key = itemCategoryKey(item);
      if (key && !views.has(key)) views.set(key, itemCategoryName(item));
    }
    return Array.from(views, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [data]);

  // Full catalog fetched once per edition; filtering happens on the
  // client because Open5e does not always honor the search/type parameters.
  const filtered = useMemo(() => {
    if (!data) return [];
    const normalizedText = debouncedText.trim().toLowerCase();

    return data.filter((item) => {
      if (normalizedText && !item.name.toLowerCase().includes(normalizedText)) {
        return false;
      }
      if (category && itemCategoryKey(item) !== category) return false;
      return true;
    });
  }, [data, debouncedText, category]);

  // Resets the visible batch when the filters change (the "adjust
  // state during render" pattern) instead of an effect, to avoid
  // triggering an extra cascading render.
  const currentFilter = `${edition}|${debouncedText}|${category}`;
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
          Añadiendo objetos a <span className="font-medium text-foreground">{character?.name ?? "…"}</span> ·{" "}
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
          placeholder="Buscar objeto por nombre..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todas las categorías</option>
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isError && <Open5eCatalogError onRetry={() => refetch()} />}
      {!isError && isLoading && <Open5eCatalogLoading />}
      {!isError && !isLoading && filtered.length === 0 && <Open5eNoResults />}

      {!isError && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <ItemCard
                key={open5eIdentifier(item)}
                item={item}
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
