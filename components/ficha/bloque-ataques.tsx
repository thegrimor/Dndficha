import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FichaPersonaje } from "@/types/personaje";

export function BloqueAtaques({ sheet }: { sheet: FichaPersonaje }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ataques</CardTitle>
      </CardHeader>
      <CardContent>
        {sheet.attacks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ataques registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-1">Nombre</th>
                <th className="py-1">Bono</th>
                <th className="py-1">Daño</th>
              </tr>
            </thead>
            <tbody>
              {sheet.attacks.map((ataque, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-1">{ataque.name}</td>
                  <td className="py-1">{ataque.bonus >= 0 ? `+${ataque.bonus}` : ataque.bonus}</td>
                  <td className="py-1">{ataque.damage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
