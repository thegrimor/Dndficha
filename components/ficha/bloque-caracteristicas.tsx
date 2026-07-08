import { Card, CardContent } from "@/components/ui/card";
import { bonoConCompetencia, modificadorConSigno } from "@/lib/dnd/calculos";
import { CARACTERISTICAS, NOMBRES_CARACTERISTICAS } from "@/lib/dnd/constantes";
import type { FichaPersonaje } from "@/types/personaje";

export function BloqueCaracteristicas({
  sheet,
  nivel,
}: {
  sheet: FichaPersonaje;
  nivel: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {CARACTERISTICAS.map((car) => {
        const puntuacion = sheet.abilityScores[car];
        const tieneSalvacion = Boolean(sheet.savingThrows[car]?.proficient);
        const salvacion = bonoConCompetencia(puntuacion, nivel, tieneSalvacion);

        return (
          <Card key={car} className="text-center">
            <CardContent className="flex flex-col items-center gap-1 p-3">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {NOMBRES_CARACTERISTICAS[car]}
              </span>
              <span className="text-2xl font-bold">{puntuacion}</span>
              <span className="text-sm text-muted-foreground">
                {modificadorConSigno(puntuacion)}
              </span>
              <span className="text-xs text-muted-foreground">
                Salv. {salvacion >= 0 ? `+${salvacion}` : salvacion}
                {tieneSalvacion ? " •" : ""}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
