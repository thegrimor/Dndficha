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
import { EDICIONES_DND, type EdicionDnD } from "@/lib/open5e/ediciones";
import {
  claveCategoriaObjeto,
  identificadorOpen5e,
  nombreCategoriaObjeto,
  type Open5eObjetoMagico,
} from "@/lib/open5e/types-recursos";

const TAMANO_LOTE_VISIBLE = 24;

async function obtenerCatalogoObjetos(edicion: EdicionDnD): Promise<Open5eObjetoMagico[]> {
  const respuesta = await fetch(`/api/open5e/magicitems?edicion=${edicion}`);
  if (!respuesta.ok) {
    throw new Error("open5e_unavailable");
  }
  const datos = (await respuesta.json()) as { results: Open5eObjetoMagico[] };
  return datos.results;
}

export function BuscadorObjetos() {
  const [edicion, setEdicion] = useState<EdicionDnD>("2014");
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [visibles, setVisibles] = useState(TAMANO_LOTE_VISIBLE);
  const textoDebounced = useDebounce(texto, 200);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["open5e", "magicitems", "completo", edicion],
    queryFn: () => obtenerCatalogoObjetos(edicion),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  // Las categorías del filtro salen de los datos ya cargados (no de una
  // lista adivinada a mano), porque los valores exactos de "category" solo
  // se conocen viendo la respuesta real de Open5e.
  const categorias = useMemo(() => {
    if (!data) return [];
    const vistas = new Map<string, string>();
    for (const objeto of data) {
      const clave = claveCategoriaObjeto(objeto);
      if (clave && !vistas.has(clave)) vistas.set(clave, nombreCategoriaObjeto(objeto));
    }
    return Array.from(vistas, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [data]);

  // Catálogo completo traído una sola vez por edición; el filtrado es en
  // cliente porque Open5e no siempre respeta los parámetros de búsqueda/tipo.
  const filtrados = useMemo(() => {
    if (!data) return [];
    const textoNormalizado = textoDebounced.trim().toLowerCase();

    return data.filter((objeto) => {
      if (textoNormalizado && !objeto.name.toLowerCase().includes(textoNormalizado)) {
        return false;
      }
      if (categoria && claveCategoriaObjeto(objeto) !== categoria) return false;
      return true;
    });
  }, [data, textoDebounced, categoria]);

  // Reinicia el lote visible cuando cambian los filtros (patrón "ajustar
  // estado durante el render" en vez de un efecto, para no disparar un
  // render extra en cascada).
  const filtroActual = `${edicion}|${textoDebounced}|${categoria}`;
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
        <select
          value={edicion}
          onChange={(evento) => setEdicion(evento.target.value as EdicionDnD)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {EDICIONES_DND.map((opcion) => (
            <option key={opcion.value} value={opcion.value}>
              {opcion.label}
            </option>
          ))}
        </select>
        <Input
          placeholder="Buscar objeto por nombre..."
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={categoria}
          onChange={(evento) => setCategoria(evento.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((opcion) => (
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
              <TarjetaObjeto key={identificadorOpen5e(objeto)} objeto={objeto} />
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
