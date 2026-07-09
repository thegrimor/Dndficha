"use client";

import { NOMBRES_CARACTERISTICAS, type Caracteristica } from "@/lib/dnd/constantes";
import { RAZAS_SRD } from "@/lib/dnd/datos-srd";
import { cn } from "@/lib/utils";
import { OpcionTarjeta } from "@/components/wizard/opcion-tarjeta";
import type { DatosWizard } from "@/components/wizard/tipos";

function textoBonificadores(bonificadorFijo: Partial<Record<Caracteristica, number>>): string {
  return Object.entries(bonificadorFijo)
    .map(([car, bono]) => `+${bono} ${NOMBRES_CARACTERISTICAS[car as Caracteristica]}`)
    .join(", ");
}

export function PasoRaza({
  datos,
  actualizar,
}: {
  datos: DatosWizard;
  actualizar: (cambios: Partial<DatosWizard>) => void;
}) {
  const raza = RAZAS_SRD.find((r) => r.id === datos.razaId);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {RAZAS_SRD.map((r) => (
          <OpcionTarjeta
            key={r.id}
            seleccionada={r.id === datos.razaId}
            onClick={() =>
              actualizar({
                razaId: r.id,
                eleccionesCaracteristicaRaza: [],
              })
            }
            titulo={r.nombre}
            subtitulo={textoBonificadores(r.bonificadorFijo)}
          >
            <span className="text-xs text-muted-foreground">
              Velocidad {r.velocidad} pies · Idiomas: {r.idiomas.join(", ")}
            </span>
          </OpcionTarjeta>
        ))}
      </div>

      {raza && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-1 font-medium">Rasgos de {raza.nombre}</h4>
          <ul className="list-inside list-disc text-muted-foreground">
            {raza.rasgos.map((rasgo) => (
              <li key={rasgo.nombre}>
                <span className="font-medium text-foreground">{rasgo.nombre}:</span> {rasgo.descripcion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {raza?.eleccionLibre && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-2 font-medium">
            Elige {raza.eleccionLibre.cantidad} característica(s) que reciben +{raza.eleccionLibre.valor}
          </h4>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(NOMBRES_CARACTERISTICAS) as Caracteristica[])
              .filter((car) => !raza.eleccionLibre?.excluir?.includes(car))
              .map((car) => {
                const marcada = datos.eleccionesCaracteristicaRaza.includes(car);
                const limiteAlcanzado =
                  datos.eleccionesCaracteristicaRaza.length >= (raza.eleccionLibre?.cantidad ?? 0);
                return (
                  <label
                    key={car}
                    className={cn(
                      "flex items-center gap-1.5",
                      !marcada && limiteAlcanzado && "opacity-40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={marcada}
                      disabled={!marcada && limiteAlcanzado}
                      onChange={() => {
                        const nuevas = marcada
                          ? datos.eleccionesCaracteristicaRaza.filter((c) => c !== car)
                          : [...datos.eleccionesCaracteristicaRaza, car];
                        actualizar({ eleccionesCaracteristicaRaza: nuevas });
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                    {NOMBRES_CARACTERISTICAS[car]}
                  </label>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
