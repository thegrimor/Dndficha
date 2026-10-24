"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Open5eCatalogLoading,
  Open5eCatalogError,
  Open5eNoResults,
} from "@/components/search/open5e-status";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { Open5eMonster } from "@dndficha/rules";
import type { Open5ePagedResponse } from "@/lib/open5e/types";

const PAGE_LIMIT = 20;

async function searchMonsters(
  text: string,
  offset: number
): Promise<Open5ePagedResponse<Open5eMonster>> {
  const params = new URLSearchParams();
  if (text) params.set("search", text);
  params.set("limit", String(PAGE_LIMIT));
  params.set("offset", String(offset));

  const response = await fetch(`/api/open5e/monsters?${params.toString()}`);
  if (!response.ok) {
    throw new Error("open5e_unavailable");
  }
  return (await response.json()) as Open5ePagedResponse<Open5eMonster>;
}

/**
 * Minimal version of the search: just a list + text search. Monsters are
 * not part of the "add to sheet" MVP, so they do not have the button the
 * spell/item cards have.
 */
export function MonsterSearch() {
  const [text, setText] = useState("");
  const debouncedText = useDebounce(text, 350);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["open5e", "monsters", debouncedText],
    queryFn: ({ pageParam }) => searchMonsters(debouncedText, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined;
      return allPages.reduce((total, page) => total + page.results.length, 0);
    },
    retry: 0,
  });

  const results = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Input
        placeholder="Buscar monstruo por nombre..."
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="sm:max-w-xs"
      />

      {isError && <Open5eCatalogError onRetry={() => refetch()} />}
      {!isError && isLoading && <Open5eCatalogLoading />}
      {!isError && !isLoading && results.length === 0 && <Open5eNoResults />}

      {!isError && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((monster) => (
              <Card key={monster.slug}>
                <CardHeader>
                  <CardTitle className="normal-case tracking-normal text-base font-semibold">
                    {monster.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {monster.size ?? ""} {monster.type ?? "Tipo desconocido"}
                    {(monster.challenge_rating ?? monster.cr) !== undefined &&
                      ` · CR ${monster.challenge_rating ?? monster.cr}`}
                  </p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {monster.armor_class !== undefined && (
                    <p>CA {monster.armor_class}</p>
                  )}
                  {monster.hit_points !== undefined && (
                    <p>PG {monster.hit_points}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Cargando..." : "Cargar más"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
