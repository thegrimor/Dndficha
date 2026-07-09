"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CargandoCatalogoOpen5e,
  ErrorCatalogoOpen5e,
  SinResultadosOpen5e,
} from "@/components/buscador/estado-open5e";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { Open5eMonstruo } from "@/lib/open5e/types-recursos";
import type { RespuestaPaginadaOpen5e } from "@/lib/open5e/types";

const LIMITE_POR_PAGINA = 20;

async function buscarMonstruos(
  texto: string,
  offset: number
): Promise<RespuestaPaginadaOpen5e<Open5eMonstruo>> {
  const params = new URLSearchParams();
  if (texto) params.set("search", texto);
  params.set("limit", String(LIMITE_POR_PAGINA));
  params.set("offset", String(offset));

  const respuesta = await fetch(`/api/open5e/monsters?${params.toString()}`);
  if (!respuesta.ok) {
    throw new Error("open5e_unavailable");
  }
  return (await respuesta.json()) as RespuestaPaginadaOpen5e<Open5eMonstruo>;
}

/**
 * Versión mínima del buscador: solo lista + búsqueda por texto. Los
 * monstruos no forman parte del MVP de "añadir a ficha", así que no llevan
 * el botón de las tarjetas de hechizos/objetos.
 */
export function BuscadorMonstruos() {
  const [texto, setTexto] = useState("");
  const textoDebounced = useDebounce(texto, 350);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["open5e", "monsters", textoDebounced],
    queryFn: ({ pageParam }) => buscarMonstruos(textoDebounced, pageParam),
    initialPageParam: 0,
    getNextPageParam: (ultimaPagina, todasLasPaginas) => {
      if (!ultimaPagina.next) return undefined;
      return todasLasPaginas.reduce((total, pagina) => total + pagina.results.length, 0);
    },
    retry: 0,
  });

  const resultados = data?.pages.flatMap((pagina) => pagina.results) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Input
        placeholder="Buscar monstruo por nombre..."
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        className="sm:max-w-xs"
      />

      {isError && <ErrorCatalogoOpen5e onReintentar={() => refetch()} />}
      {!isError && isLoading && <CargandoCatalogoOpen5e />}
      {!isError && !isLoading && resultados.length === 0 && <SinResultadosOpen5e />}

      {!isError && resultados.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((monstruo) => (
              <Card key={monstruo.slug}>
                <CardHeader>
                  <CardTitle className="normal-case tracking-normal text-base font-semibold">
                    {monstruo.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {monstruo.size ?? ""} {monstruo.type ?? "Tipo desconocido"}
                    {(monstruo.challenge_rating ?? monstruo.cr) !== undefined &&
                      ` · CR ${monstruo.challenge_rating ?? monstruo.cr}`}
                  </p>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {monstruo.armor_class !== undefined && (
                    <p>CA {monstruo.armor_class}</p>
                  )}
                  {monstruo.hit_points !== undefined && (
                    <p>PG {monstruo.hit_points}</p>
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
