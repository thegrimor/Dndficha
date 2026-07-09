"use client";

import { HABILIDADES } from "@/lib/dnd/constantes";
import { IDIOMAS_DISPONIBLES, RAZAS_SRD, TRASFONDOS_SRD } from "@/lib/dnd/datos-srd";
import { cn } from "@/lib/utils";
import { OpcionTarjeta } from "@/components/wizard/opcion-tarjeta";
import type { DatosWizard } from "@/components/wizard/tipos";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TRASFONDOS_SRD.map((t) => (
          <OpcionTarjeta
            key={t.id}
            seleccionada={t.id === datos.trasfondoId}
            onClick={() => actualizar({ trasfondoId: t.id, idiomasTrasfondoElegidos: [] })}
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
    </div>
  );
}
