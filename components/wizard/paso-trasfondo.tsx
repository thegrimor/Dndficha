"use client";

import { HABILIDADES, NOMBRES_CARACTERISTICAS, type Caracteristica } from "@/lib/dnd/constantes";
import { IDIOMAS_DISPONIBLES, RAZAS_SRD, TRASFONDOS_SRD } from "@/lib/dnd/datos-srd";
import { DOTES_SRD } from "@/lib/dnd/dotes";
import type { BonificadorTrasfondoElegido } from "@/lib/dnd/competencias";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { OpcionTarjeta } from "@/components/wizard/opcion-tarjeta";
import type { DatosWizard, DoteOrigenElegida } from "@/components/wizard/tipos";

const BONIFICADOR_INICIAL: BonificadorTrasfondoElegido = { modo: "reparto", mas2: null, mas1: null };
const DOTE_INICIAL: DoteOrigenElegida = { modo: "catalogo", doteId: null, manualNombre: "", manualDescripcion: "" };

export function PasoTrasfondo({
  datos,
  actualizar,
}: {
  datos: DatosWizard;
  actualizar: (cambios: Partial<DatosWizard>) => void;
}) {
  const trasfondo = TRASFONDOS_SRD.find((t) => t.id === datos.trasfondoId);
  const raza = RAZAS_SRD.find((r) => r.id === datos.razaId);
  const idiomasYaConocidos = new Set(raza?.idiomas ?? []);
  const idiomasElegibles = IDIOMAS_DISPONIBLES.filter((idioma) => !idiomasYaConocidos.has(idioma));
  const es2024 = datos.edicion === "2024";
  const opcionesBonificador = trasfondo?.bonificadorCaracteristicas ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TRASFONDOS_SRD.map((t) => (
          <OpcionTarjeta
            key={t.id}
            seleccionada={t.id === datos.trasfondoId}
            onClick={() =>
              actualizar({
                trasfondoId: t.id,
                idiomasTrasfondoElegidos: [],
                bonificadorTrasfondo: BONIFICADOR_INICIAL,
                doteOrigen: DOTE_INICIAL,
              })
            }
            titulo={t.nombre}
            subtitulo={t.competenciasHabilidad
              .map((id) => HABILIDADES.find((h) => h.id === id)?.nombre ?? id)
              .join(", ")}
          />
        ))}
      </div>

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
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DOTES_SRD.map((dote) => (
                <OpcionTarjeta
                  key={dote.id}
                  seleccionada={dote.id === datos.doteOrigen.doteId}
                  onClick={() =>
                    actualizar({ doteOrigen: { ...datos.doteOrigen, doteId: dote.id } })
                  }
                  titulo={dote.nombre}
                  subtitulo={dote.descripcion}
                />
              ))}
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
