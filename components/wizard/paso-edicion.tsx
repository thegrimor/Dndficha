"use client";

import { EDICIONES_DND, type EdicionDnD } from "@/lib/open5e/ediciones";
import { OpcionTarjeta } from "@/components/wizard/opcion-tarjeta";
import type { DatosWizard } from "@/components/wizard/tipos";

const DESCRIPCIONES: Record<EdicionDnD, string> = {
  "2014": "Reglas clásicas (Manual del Jugador 2014). Las razas dan el bonificador de característica.",
  "2024": "Reglas revisadas ('One D&D'). El trasfondo da el bonificador de característica; las razas se llaman especies.",
};

export function PasoEdicion({
  datos,
  actualizar,
}: {
  datos: DatosWizard;
  actualizar: (cambios: Partial<DatosWizard>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Elige con qué edición de reglas juegas. El buscador de hechizos y objetos de esta
        ficha usará automáticamente esta edición, sin tener que volver a elegirla cada vez.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {EDICIONES_DND.map((opcion) => (
          <OpcionTarjeta
            key={opcion.value}
            seleccionada={opcion.value === datos.edicion}
            onClick={() => actualizar({ edicion: opcion.value })}
            titulo={opcion.label}
          >
            <span className="text-xs text-muted-foreground">{DESCRIPCIONES[opcion.value]}</span>
          </OpcionTarjeta>
        ))}
      </div>
    </div>
  );
}
