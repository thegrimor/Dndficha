"use client";

import { CARACTERISTICAS, NOMBRES_CARACTERISTICAS, type Caracteristica } from "@/lib/dnd/constantes";
import { modificadorConSigno } from "@/lib/dnd/calculos";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ARRAY_ESTANDAR, type DatosWizard, type MetodoPuntuaciones } from "@/components/wizard/tipos";

const SIN_ASIGNAR = 0;

export function PasoPuntuaciones({
  datos,
  actualizar,
}: {
  datos: DatosWizard;
  actualizar: (cambios: Partial<DatosWizard>) => void;
}) {
  function cambiarMetodo(metodo: MetodoPuntuaciones) {
    actualizar({
      metodoPuntuaciones: metodo,
      puntuacionesBase:
        metodo === "array"
          ? { str: SIN_ASIGNAR, dex: SIN_ASIGNAR, con: SIN_ASIGNAR, int: SIN_ASIGNAR, wis: SIN_ASIGNAR, cha: SIN_ASIGNAR }
          : { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    });
  }

  function asignarValorArray(car: Caracteristica, valor: number) {
    actualizar({ puntuacionesBase: { ...datos.puntuacionesBase, [car]: valor } });
  }

  function asignarValorManual(car: Caracteristica, valor: number) {
    actualizar({ puntuacionesBase: { ...datos.puntuacionesBase, [car]: valor } });
  }

  const valoresUsados = CARACTERISTICAS.map((car) => datos.puntuacionesBase[car]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(["array", "manual"] as const).map((metodo) => (
          <button
            key={metodo}
            type="button"
            onClick={() => cambiarMetodo(metodo)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium",
              datos.metodoPuntuaciones === metodo
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-secondary"
            )}
          >
            {metodo === "array" ? "Array estándar" : "Tirada manual"}
          </button>
        ))}
      </div>

      {datos.metodoPuntuaciones === "array" ? (
        <p className="text-sm text-muted-foreground">
          Asigna cada valor de {ARRAY_ESTANDAR.join(", ")} a una característica distinta.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Introduce el resultado de tus tiradas (por ejemplo 4d6 quita el menor) para cada característica.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARACTERISTICAS.map((car) => {
          const valor = datos.puntuacionesBase[car];
          return (
            <div key={car} className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3">
              <label className="text-sm font-medium">{NOMBRES_CARACTERISTICAS[car]}</label>
              {datos.metodoPuntuaciones === "array" ? (
                <select
                  value={valor === SIN_ASIGNAR ? "" : valor}
                  onChange={(e) => asignarValorArray(car, e.target.value ? Number(e.target.value) : SIN_ASIGNAR)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- Elegir --</option>
                  {ARRAY_ESTANDAR.map((v) => (
                    <option key={v} value={v} disabled={valoresUsados.includes(v) && valor !== v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={valor}
                  onChange={(e) => asignarValorManual(car, Number(e.target.value))}
                />
              )}
              {valor > 0 && (
                <span className="text-xs text-muted-foreground">Modificador {modificadorConSigno(valor)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
