"use client";

import { HABILIDADES, NOMBRES_CARACTERISTICAS } from "@/lib/dnd/constantes";
import { CLASES_SRD } from "@/lib/dnd/datos-srd";
import { cn } from "@/lib/utils";
import { OpcionTarjeta } from "@/components/wizard/opcion-tarjeta";
import type { DatosWizard } from "@/components/wizard/tipos";

export function PasoClase({
  datos,
  actualizar,
}: {
  datos: DatosWizard;
  actualizar: (cambios: Partial<DatosWizard>) => void;
}) {
  const clase = CLASES_SRD.find((c) => c.id === datos.claseId);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CLASES_SRD.map((c) => (
          <OpcionTarjeta
            key={c.id}
            seleccionada={c.id === datos.claseId}
            onClick={() => actualizar({ claseId: c.id, habilidadesClaseElegidas: [] })}
            titulo={c.nombre}
            subtitulo={`Dado de golpe d${c.dadoGolpe}`}
          >
            <span className="text-xs text-muted-foreground">
              Salvaciones: {c.salvacionesCompetentes.map((s) => NOMBRES_CARACTERISTICAS[s]).join(", ")}
              {c.caracteristicaConjuro && (
                <> · Conjuro: {NOMBRES_CARACTERISTICAS[c.caracteristicaConjuro]}</>
              )}
            </span>
          </OpcionTarjeta>
        ))}
      </div>

      {clase && (
        <>
          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            <h4 className="mb-1 font-medium">Rasgos de nivel 1 de {clase.nombre}</h4>
            <ul className="list-inside list-disc text-muted-foreground">
              {clase.rasgosNivel1.map((rasgo) => (
                <li key={rasgo.nombre}>
                  <span className="font-medium text-foreground">{rasgo.nombre}:</span> {rasgo.descripcion}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            <h4 className="mb-2 font-medium">
              Elige {clase.numHabilidadesElegibles} habilidad(es) competentes
              {" "}
              ({datos.habilidadesClaseElegidas.length}/{clase.numHabilidadesElegibles})
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {clase.habilidadesDisponibles.map((idHabilidad) => {
                const habilidad = HABILIDADES.find((h) => h.id === idHabilidad);
                if (!habilidad) return null;
                const marcada = datos.habilidadesClaseElegidas.includes(idHabilidad);
                const limiteAlcanzado =
                  datos.habilidadesClaseElegidas.length >= clase.numHabilidadesElegibles;
                return (
                  <label
                    key={idHabilidad}
                    className={cn(
                      "flex items-center gap-1.5 text-sm",
                      !marcada && limiteAlcanzado && "opacity-40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={marcada}
                      disabled={!marcada && limiteAlcanzado}
                      onChange={() => {
                        const nuevas = marcada
                          ? datos.habilidadesClaseElegidas.filter((h) => h !== idHabilidad)
                          : [...datos.habilidadesClaseElegidas, idHabilidad];
                        actualizar({ habilidadesClaseElegidas: nuevas });
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                    {habilidad.nombre}
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
