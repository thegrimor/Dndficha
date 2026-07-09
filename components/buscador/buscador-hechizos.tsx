"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TarjetaHechizo } from "@/components/buscador/tarjeta-hechizo";
import {
  CargandoCatalogoOpen5e,
  ErrorCatalogoOpen5e,
  SinResultadosOpen5e,
} from "@/components/buscador/estado-open5e";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { ESCUELAS_HECHIZO, NIVELES_HECHIZO, type Open5eHechizo } from "@/lib/open5e/types-recursos";
import type { RespuestaPaginadaOpen5e } from "@/lib/open5e/types";

const LIMITE_POR_PAGINA = 20;

async function buscarHechizos(
  texto: string,
  nivel: string,
  escuela: string,
  offset: number
): Promise<RespuestaPaginadaOpen5e<Open5eHechizo>> {
  const params = new URLSearchParams();
  if (texto) params.set("search", texto);
  if (nivel) params.set("level", nivel);
  if (escuela) params.set("school", escuela);
  params.set("limit", String(LIMITE_POR_PAGINA));
  params.set("offset", String(offset));

  const respuesta = await fetch(`/api/open5e/spells?${params.toString()}`);
  if (!respuesta.ok) {
    throw new Error("open5e_unavailable");
  }
  return (await respuesta.json()) as RespuestaPaginadaOpen5e<Open5eHechizo>;
}

export function BuscadorHechizos() {
  const [texto, setTexto] = useState("");
  const [nivel, setNivel] = useState("");
  const [escuela, setEscuela] = useState("");
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
    queryKey: ["open5e", "spells", textoDebounced, nivel, escuela],
    queryFn: ({ pageParam }) => buscarHechizos(textoDebounced, nivel, escuela, pageParam),
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar hechizo por nombre..."
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={nivel}
          onChange={(evento) => setNivel(evento.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todos los niveles</option>
          {NIVELES_HECHIZO.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
        <select
          value={escuela}
          onChange={(evento) => setEscuela(evento.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todas las escuelas</option>
          {ESCUELAS_HECHIZO.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
      </div>

      {isError && <ErrorCatalogoOpen5e onReintentar={() => refetch()} />}
      {!isError && isLoading && <CargandoCatalogoOpen5e />}
      {!isError && !isLoading && resultados.length === 0 && <SinResultadosOpen5e />}

      {!isError && resultados.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((hechizo) => (
              <TarjetaHechizo key={hechizo.slug} hechizo={hechizo} />
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
