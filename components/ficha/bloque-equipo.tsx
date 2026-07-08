import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FichaPersonaje } from "@/types/personaje";

export function BloqueEquipo({ sheet }: { sheet: FichaPersonaje }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipo</CardTitle>
      </CardHeader>
      <CardContent>
        {sheet.inventory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Inventario vacío. Añade objetos desde el buscador SRD.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {sheet.inventory.map((objeto, i) => (
              <li key={i} className="flex justify-between border-b border-border py-1">
                <span>{objeto.nombre}</span>
                <span className="text-muted-foreground">{objeto.tipo}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
