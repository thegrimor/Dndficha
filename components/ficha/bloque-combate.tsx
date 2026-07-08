import { Card, CardContent } from "@/components/ui/card";
import type { FichaPersonaje } from "@/types/personaje";

export function BloqueCombate({ sheet }: { sheet: FichaPersonaje }) {
  const { ac, initiative, speed, hp, hitDice } = sheet.combat;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      <StatCard etiqueta="CA" valor={ac} />
      <StatCard etiqueta="Iniciativa" valor={initiative >= 0 ? `+${initiative}` : initiative} />
      <StatCard etiqueta="Velocidad" valor={`${speed} ft`} />
      <StatCard etiqueta="PG" valor={`${hp.current}/${hp.max}`} />
      <StatCard etiqueta="Dados de golpe" valor={hitDice} />
    </div>
  );
}

function StatCard({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center gap-1 p-3">
        <span className="text-xs font-medium uppercase text-muted-foreground">{etiqueta}</span>
        <span className="text-xl font-bold">{valor}</span>
      </CardContent>
    </Card>
  );
}
