"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TarjetaObjeto } from "@/components/buscador/tarjeta-objeto";
import {
  CargandoCatalogoOpen5e,
  ErrorCatalogoOpen5e,
  SinResultadosOpen5e,
} from "@/components/buscador/estado-open5e";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { Open5eObjetoMagico } from "@/lib/open5e/types-recursos";
import type { RespuestaPaginadaOpen5e } from "@/lib/open5e/types";

const LIMITE_POR_PAGINA = 20;

// Tipos de objeto mágico más comunes del SRD; Open5e no expone un endpoint
// de "choices" así que se mantiene esta lista fija como filtro rápido.
const TIPOS_OBJETO = [
  { value: "Wondrous item", label: "Objeto maravilloso" },
  { value: "Weapon", label: "Arma" },
  { value: "Armor", label: "Armadura" },
  { value: "Potion", label: "Poción" },
  { value: "Ring", label: "Anillo" },
  { value: "Rod", label: "Vara" },
  { value: "Scroll", label: "Pergamino" },
  { value: "Staff", label: "Bastón" },
  { value: "Wand", label: "Varita" },
];

async function buscarObjetos(
  texto: string,
  tipo: string,
  offset: number
): Promise<RespuestaPaginadaOpen5e<Open5eObjetoMagico>> {
  const params = new URLSearchParams();
  if (texto) params.set("search", texto);
  if (tipo) params.set("type", tipo);
  params.set("limit", String(LIMITE_POR_PAGINA));
  params.set("offset", String(offset));

  const respuesta = await fetch(`/api/open5e/magicitems?${params.toString()}`);
  if (!respuesta.ok) {
    throw new Error("open5e_unavailable");
  }
  return (await respuesta.json()) as RespuestaPaginadaOpen5e<Open5eObjetoMagico>;
}

export function BuscadorObjetos() {
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState("");
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
    queryKey: ["open5e", "magicitems", textoDebounced, tipo],
    queryFn: ({ pageParam }) => buscarObjetos(textoDebounced, tipo, pageParam),
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
          placeholder="Buscar objeto por nombre..."
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_OBJETO.map((opcion) => (
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
            {resultados.map((objeto) => (
              <TarjetaObjeto key={objeto.slug} objeto={objeto} />
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
