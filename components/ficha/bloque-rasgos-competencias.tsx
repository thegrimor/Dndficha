import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FichaPersonaje } from "@/types/personaje";

export function BloqueRasgosCompetencias({ sheet }: { sheet: FichaPersonaje }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rasgos, competencias e idiomas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div>
          <h4 className="font-medium">Rasgos</h4>
          {sheet.features.length === 0 ? (
            <p className="text-muted-foreground">Sin rasgos registrados.</p>
          ) : (
            <ul className="list-inside list-disc">
              {sheet.features.map((rasgo, i) => (
                <li key={i}>
                  <span className="font-medium">{rasgo.nombre}:</span> {rasgo.descripcion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="font-medium">Idiomas</h4>
          <p className="text-muted-foreground">
            {sheet.languages.length > 0 ? sheet.languages.join(", ") : "Ninguno registrado."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
