"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { HABILIDADES, NOMBRES_CARACTERISTICAS, type Caracteristica } from "@/lib/dnd/constantes";
import { IDIOMAS_DISPONIBLES, RAZAS_SRD } from "@/lib/dnd/datos-srd";
import { DOTES_SRD } from "@/lib/dnd/dotes";
import { trasfondoDesdeOpen5e } from "@/lib/dnd/trasfondos-open5e";
import type { BonificadorTrasfondoElegido } from "@/lib/dnd/competencias";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  CargandoCatalogoOpen5e,
  ErrorCatalogoOpen5e,
  SinResultadosOpen5e,
} from "@/components/buscador/estado-open5e";
import { OpcionTarjeta } from "@/components/wizard/opcion-tarjeta";
import type { DatosWizard, DoteOrigenElegida } from "@/components/wizard/tipos";
import { identificadorOpen5e, type Open5eTrasfondo } from "@/lib/open5e/types-recursos";

const BONIFICADOR_INICIAL: BonificadorTrasfondoElegido = { modo: "reparto", mas2: null, mas1: null };
const DOTE_INICIAL: DoteOrigenElegida = { modo: "catalogo", doteElegida: null, manualNombre: "", manualDescripcion: "" };
const TIMEOUT_CLIENTE_MS = 15000;
const LARGO_SUBTITULO = 140;

function recortar(texto: string, largo: number): string {
  return texto.length > largo ? `${texto.slice(0, largo).trim()}…` : texto;
}

async function obtenerCatalogoOpen5e<T>(recurso: "backgrounds", edicion: string): Promise<T[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_CLIENTE_MS);
  try {
    const respuesta = await fetch(`/api/open5e/${recurso}?edicion=${edicion}`, { signal: controller.signal });
    if (!respuesta.ok) throw new Error("open5e_unavailable");
    const datos = (await respuesta.json()) as { results: T[] };
    return datos.results;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function PasoTrasfondo({
  datos,
  actualizar,
}: {
  datos: DatosWizard;
  actualizar: (cambios: Partial<DatosWizard>) => void;
}) {
  const trasfondo = datos.trasfondoDatos;
  const raza = RAZAS_SRD.find((r) => r.id === datos.razaId);
  const idiomasYaConocidos = new Set(raza?.idiomas ?? []);
  const idiomasElegibles = IDIOMAS_DISPONIBLES.filter((idioma) => !idiomasYaConocidos.has(idioma));
  const es2024 = datos.edicion === "2024";
  const opcionesBonificador = trasfondo?.bonificadorCaracteristicas ?? [];

  const [textoTrasfondo, setTextoTrasfondo] = useState("");
  const textoTrasfondoDebounced = useDebounce(textoTrasfondo, 200);

  const {
    data: trasfondosOpen5e,
    isLoading: cargandoTrasfondos,
    isError: errorTrasfondos,
    refetch: reintentarTrasfondos,
  } = useQuery({
    queryKey: ["open5e", "backgrounds", "completo", datos.edicion],
    queryFn: () => obtenerCatalogoOpen5e<Open5eTrasfondo>("backgrounds", datos.edicion),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  const trasfondosFiltrados = useMemo(() => {
    if (!trasfondosOpen5e) return [];
    const texto = textoTrasfondoDebounced.trim().toLowerCase();
    const lista = texto ? trasfondosOpen5e.filter((bg) => bg.name.toLowerCase().includes(texto)) : trasfondosOpen5e;
    return lista.map((bg) => ({ bg, normalizado: trasfondoDesdeOpen5e(bg) }));
  }, [trasfondosOpen5e, textoTrasfondoDebounced]);

  const [textoDote, setTextoDote] = useState("");
  const textoDoteDebounced = useDebounce(textoDote, 200);

  const dotesFiltradas = useMemo(() => {
    const texto = textoDoteDebounced.trim().toLowerCase();
    return texto ? DOTES_SRD.filter((dote) => dote.nombre.toLowerCase().includes(texto)) : DOTES_SRD;
  }, [textoDoteDebounced]);

  function elegirTrasfondo(bg: Open5eTrasfondo) {
    actualizar({
      trasfondoId: identificadorOpen5e(bg),
      trasfondoDatos: trasfondoDesdeOpen5e(bg),
      idiomasTrasfondoElegidos: [],
      bonificadorTrasfondo: BONIFICADOR_INICIAL,
      doteOrigen: DOTE_INICIAL,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Buscar trasfondo por nombre..."
        value={textoTrasfondo}
        onChange={(e) => setTextoTrasfondo(e.target.value)}
        className="sm:max-w-xs"
      />

      {errorTrasfondos && <ErrorCatalogoOpen5e onReintentar={() => reintentarTrasfondos()} />}
      {!errorTrasfondos && cargandoTrasfondos && <CargandoCatalogoOpen5e />}
      {!errorTrasfondos && !cargandoTrasfondos && trasfondosFiltrados.length === 0 && <SinResultadosOpen5e />}

      {!errorTrasfondos && trasfondosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {trasfondosFiltrados.map(({ bg, normalizado }) => (
            <OpcionTarjeta
              key={identificadorOpen5e(bg)}
              seleccionada={identificadorOpen5e(bg) === datos.trasfondoId}
              onClick={() => elegirTrasfondo(bg)}
              titulo={normalizado.nombre}
              subtitulo={
                normalizado.competenciasHabilidad.length > 0
                  ? normalizado.competenciasHabilidad
                      .map((id) => HABILIDADES.find((h) => h.id === id)?.nombre ?? id)
                      .join(", ")
                  : recortar(bg.desc ?? "", LARGO_SUBTITULO)
              }
            />
          ))}
        </div>
      )}

      {trasfondo && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-1 font-medium">{trasfondo.rasgo.nombre}</h4>
          <p className="text-muted-foreground">{trasfondo.rasgo.descripcion}</p>
        </div>
      )}

      {trasfondo && trasfondo.numIdiomasElegibles > 0 && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-2 font-medium">
            Elige {trasfondo.numIdiomasElegibles} idioma(s) adicional(es)
            {" "}
            ({datos.idiomasTrasfondoElegidos.length}/{trasfondo.numIdiomasElegibles})
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {idiomasElegibles.map((idioma) => {
              const marcado = datos.idiomasTrasfondoElegidos.includes(idioma);
              const limiteAlcanzado =
                datos.idiomasTrasfondoElegidos.length >= trasfondo.numIdiomasElegibles;
              return (
                <label
                  key={idioma}
                  className={cn(
                    "flex items-center gap-1.5 text-sm",
                    !marcado && limiteAlcanzado && "opacity-40"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={marcado}
                    disabled={!marcado && limiteAlcanzado}
                    onChange={() => {
                      const nuevos = marcado
                        ? datos.idiomasTrasfondoElegidos.filter((i) => i !== idioma)
                        : [...datos.idiomasTrasfondoElegidos, idioma];
                      actualizar({ idiomasTrasfondoElegidos: nuevos });
                    }}
                    className="h-4 w-4 rounded border-border"
                  />
                  {idioma}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {es2024 && trasfondo && opcionesBonificador.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-2 font-medium">Bonificador de característica del trasfondo</h4>
          <div className="mb-3 flex gap-2">
            {(["reparto", "parejo"] as const).map((modo) => (
              <button
                key={modo}
                type="button"
                onClick={() =>
                  actualizar({
                    bonificadorTrasfondo: { modo, mas2: null, mas1: null },
                  })
                }
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  datos.bonificadorTrasfondo.modo === modo
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                {modo === "reparto" ? "+2 a una, +1 a otra" : "+1 a las tres"}
              </button>
            ))}
          </div>

          {datos.bonificadorTrasfondo.modo === "reparto" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Característica principal (+2)
                </span>
                <select
                  value={datos.bonificadorTrasfondo.mas2 ?? ""}
                  onChange={(e) => {
                    const mas2 = (e.target.value || null) as Caracteristica | null;
                    const mas1 = datos.bonificadorTrasfondo.mas1 === mas2 ? null : datos.bonificadorTrasfondo.mas1;
                    actualizar({ bonificadorTrasfondo: { ...datos.bonificadorTrasfondo, mas2, mas1 } });
                  }}
                  className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- Elegir --</option>
                  {opcionesBonificador.map((car) => (
                    <option key={car} value={car}>
                      {NOMBRES_CARACTERISTICAS[car]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Característica secundaria (+1)
                </span>
                <select
                  value={datos.bonificadorTrasfondo.mas1 ?? ""}
                  onChange={(e) =>
                    actualizar({
                      bonificadorTrasfondo: {
                        ...datos.bonificadorTrasfondo,
                        mas1: (e.target.value || null) as Caracteristica | null,
                      },
                    })
                  }
                  className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- Elegir --</option>
                  {opcionesBonificador
                    .filter((car) => car !== datos.bonificadorTrasfondo.mas2)
                    .map((car) => (
                      <option key={car} value={car}>
                        {NOMBRES_CARACTERISTICAS[car]}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          ) : (
            <p className="text-muted-foreground">
              +1 a {opcionesBonificador.map((car) => NOMBRES_CARACTERISTICAS[car]).join(", ")}.
            </p>
          )}
        </div>
      )}

      {es2024 && trasfondo && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-2 font-medium">Dote de origen (nivel 1)</h4>
          <div className="mb-3 flex gap-2">
            {(["catalogo", "manual"] as const).map((modo) => (
              <button
                key={modo}
                type="button"
                onClick={() => actualizar({ doteOrigen: { ...DOTE_INICIAL, modo } })}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  datos.doteOrigen.modo === modo
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                {modo === "catalogo" ? "Elegir del catálogo" : "Escribir a mano"}
              </button>
            ))}
          </div>

          {datos.doteOrigen.modo === "catalogo" ? (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Buscar dote por nombre..."
                value={textoDote}
                onChange={(e) => setTextoDote(e.target.value)}
                className="sm:max-w-xs"
              />

              {dotesFiltradas.length === 0 && <SinResultadosOpen5e />}

              {dotesFiltradas.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {dotesFiltradas.map((dote) => (
                    <OpcionTarjeta
                      key={dote.id}
                      seleccionada={dote.nombre === datos.doteOrigen.doteElegida?.nombre}
                      onClick={() =>
                        actualizar({
                          doteOrigen: {
                            ...datos.doteOrigen,
                            doteElegida: { nombre: dote.nombre, descripcion: dote.descripcion },
                          },
                        })
                      }
                      titulo={dote.nombre}
                      subtitulo={dote.descripcion}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">Nombre de la dote</span>
                <Input
                  value={datos.doteOrigen.manualNombre}
                  onChange={(e) =>
                    actualizar({ doteOrigen: { ...datos.doteOrigen, manualNombre: e.target.value } })
                  }
                  placeholder="Ej. Experto en armas de asta"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">Descripción</span>
                <Input
                  value={datos.doteOrigen.manualDescripcion}
                  onChange={(e) =>
                    actualizar({ doteOrigen: { ...datos.doteOrigen, manualDescripcion: e.target.value } })
                  }
                  placeholder="Qué hace esta dote"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
