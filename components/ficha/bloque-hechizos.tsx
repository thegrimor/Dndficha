import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FichaPersonaje } from "@/types/personaje";

export function BloqueHechizos({ sheet }: { sheet: FichaPersonaje }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hechizos</CardTitle>
      </CardHeader>
      <CardContent>
        {sheet.spells.known.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin hechizos conocidos todavía. Búscalos en el catálogo SRD.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {sheet.spells.known.map((hechizo, i) => (
              <li key={i} className="flex justify-between border-b border-border py-1">
                <span>
                  {hechizo.prepared ? "●" : "○"} {hechizo.nombre}
                </span>
                <span className="text-muted-foreground">Nivel {hechizo.nivel}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
