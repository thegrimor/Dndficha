"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { obtenerPersonaje } from "@/actions/personajes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TarjetaHechizo } from "@/components/buscador/tarjeta-hechizo";
import {
  CargandoCatalogoOpen5e,
  ErrorCatalogoOpen5e,
  SinResultadosOpen5e,
} from "@/components/buscador/estado-open5e";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { EDICIONES_DND, type EdicionDnD } from "@/lib/open5e/ediciones";
import {
  claveEscuela,
  ESCUELAS_HECHIZO,
  identificadorOpen5e,
  NIVELES_HECHIZO,
  nivelHechizo,
  type Open5eHechizo,
} from "@/lib/open5e/types-recursos";

const TAMANO_LOTE_VISIBLE = 24;

async function obtenerCatalogoHechizos(edicion: EdicionDnD): Promise<Open5eHechizo[]> {
  const respuesta = await fetch(`/api/open5e/spells?edicion=${edicion}`);
  if (!respuesta.ok) {
    throw new Error("open5e_unavailable");
  }
  const datos = (await respuesta.json()) as { results: Open5eHechizo[] };
  return datos.results;
}

export function BuscadorHechizos() {
  // Si venimos desde la ficha de un personaje (`?personaje=<id>`), la
  // edición y el destino de "Añadir a ficha" quedan fijados por esa ficha:
  // no hay que volver a elegirlos.
  const searchParams = useSearchParams();
  const personajeId = searchParams.get("personaje");

  const { data: personaje } = useQuery({
    queryKey: ["personaje-para-buscador", personajeId],
    queryFn: () => obtenerPersonaje(personajeId as string),
    enabled: Boolean(personajeId),
    staleTime: 5 * 60 * 1000,
  });

  const [edicionManual, setEdicionManual] = useState<EdicionDnD>("2014");
  const edicion = personajeId ? personaje?.sheet.edicion : edicionManual;

  const [texto, setTexto] = useState("");
  const [nivel, setNivel] = useState("");
  const [escuela, setEscuela] = useState("");
  const [visibles, setVisibles] = useState(TAMANO_LOTE_VISIBLE);
  const textoDebounced = useDebounce(texto, 200);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["open5e", "spells", "completo", edicion],
    queryFn: () => obtenerCatalogoHechizos(edicion as EdicionDnD),
    enabled: Boolean(edicion),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  // El catálogo completo se trae una sola vez por edición; el filtrado es
  // 100% en cliente porque Open5e no siempre respeta los parámetros de
  // búsqueda/nivel/escuela.
  const filtrados = useMemo(() => {
    if (!data) return [];
    const textoNormalizado = textoDebounced.trim().toLowerCase();

    return data.filter((hechizo) => {
      if (textoNormalizado && !hechizo.name.toLowerCase().includes(textoNormalizado)) {
        return false;
      }
      if (nivel !== "" && nivelHechizo(hechizo) !== Number(nivel)) return false;
      if (escuela && claveEscuela(hechizo.school) !== escuela) return false;
      return true;
    });
  }, [data, textoDebounced, nivel, escuela]);

  // Reinicia el lote visible cuando cambian los filtros (patrón "ajustar
  // estado durante el render" en vez de un efecto, para no disparar un
  // render extra en cascada).
  const filtroActual = `${edicion}|${textoDebounced}|${nivel}|${escuela}`;
  const [filtroAnterior, setFiltroAnterior] = useState(filtroActual);
  if (filtroActual !== filtroAnterior) {
    setFiltroAnterior(filtroActual);
    setVisibles(TAMANO_LOTE_VISIBLE);
  }

  const resultados = filtrados.slice(0, visibles);
  const hayMas = filtrados.length > visibles;

  return (
    <div className="flex flex-col gap-6">
      {personajeId && (
        <p className="text-sm text-muted-foreground">
          Añadiendo hechizos a <span className="font-medium text-foreground">{personaje?.name ?? "…"}</span> ·{" "}
          {EDICIONES_DND.find((e) => e.value === edicion)?.label ?? "Cargando edición..."}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {!personajeId && (
          <select
            value={edicionManual}
            onChange={(evento) => setEdicionManual(evento.target.value as EdicionDnD)}
            className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {EDICIONES_DND.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        )}
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
      {!isError && !isLoading && filtrados.length === 0 && <SinResultadosOpen5e />}

      {!isError && resultados.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((hechizo) => (
              <TarjetaHechizo
                key={identificadorOpen5e(hechizo)}
                hechizo={hechizo}
                personajeIdForzado={personajeId ?? undefined}
              />
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
