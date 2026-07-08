import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bonoConCompetencia } from "@/lib/dnd/calculos";
import { HABILIDADES } from "@/lib/dnd/constantes";
import type { FichaPersonaje } from "@/types/personaje";

export function BloqueHabilidades({
  sheet,
  nivel,
}: {
  sheet: FichaPersonaje;
  nivel: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Habilidades</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {HABILIDADES.map((habilidad) => {
          const estado = sheet.skills[habilidad.id];
          const puntuacion = sheet.abilityScores[habilidad.caracteristica];
          const bono = bonoConCompetencia(
            puntuacion,
            nivel,
            Boolean(estado?.proficient),
            Boolean(estado?.expertise)
          );

          return (
            <div
              key={habilidad.id}
              className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-secondary"
            >
              <span>
                {estado?.proficient ? "●" : "○"} {habilidad.nombre}{" "}
                <span className="text-muted-foreground">
                  ({habilidad.caracteristica})
                </span>
              </span>
              <span className="font-medium">{bono >= 0 ? `+${bono}` : bono}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
