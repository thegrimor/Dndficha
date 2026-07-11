"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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

const TAMANO_LOTE_VISIBLE = 24;

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

async function obtenerCatalogoObjetos(): Promise<Open5eObjetoMagico[]> {
  const respuesta = await fetch("/api/open5e/magicitems");
  if (!respuesta.ok) {
    throw new Error("open5e_unavailable");
  }
  const datos = (await respuesta.json()) as { results: Open5eObjetoMagico[] };
  return datos.results;
}

export function BuscadorObjetos() {
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState("");
  const [visibles, setVisibles] = useState(TAMANO_LOTE_VISIBLE);
  const textoDebounced = useDebounce(texto, 200);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["open5e", "magicitems", "completo"],
    queryFn: obtenerCatalogoObjetos,
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  // Catálogo completo traído una sola vez; el filtrado es en cliente porque
  // Open5e no siempre respeta los parámetros de búsqueda/tipo.
  const filtrados = useMemo(() => {
    if (!data) return [];
    const textoNormalizado = textoDebounced.trim().toLowerCase();

    return data.filter((objeto) => {
      if (textoNormalizado && !objeto.name.toLowerCase().includes(textoNormalizado)) {
        return false;
      }
      if (tipo && objeto.type?.toLowerCase() !== tipo.toLowerCase()) return false;
      return true;
    });
  }, [data, textoDebounced, tipo]);

  // Reinicia el lote visible cuando cambian los filtros (patrón "ajustar
  // estado durante el render" en vez de un efecto, para no disparar un
  // render extra en cascada).
  const filtroActual = `${textoDebounced}|${tipo}`;
  const [filtroAnterior, setFiltroAnterior] = useState(filtroActual);
  if (filtroActual !== filtroAnterior) {
    setFiltroAnterior(filtroActual);
    setVisibles(TAMANO_LOTE_VISIBLE);
  }

  const resultados = filtrados.slice(0, visibles);
  const hayMas = filtrados.length > visibles;

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
      {!isError && !isLoading && filtrados.length === 0 && <SinResultadosOpen5e />}

      {!isError && resultados.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((objeto) => (
              <TarjetaObjeto key={objeto.slug} objeto={objeto} />
            ))}
          </div>
          {hayMas && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibles((v) => v + TAMANO_LOTE_VISIBLE)}
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
