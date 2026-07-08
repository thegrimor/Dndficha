import { crearPersonaje } from "@/actions/personajes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Placeholder de Fase 2: formulario mínimo para crear una ficha en blanco.
// En Fase 4 esto se reemplaza por el wizard (raza → clase → trasfondo →
// puntuaciones → resumen) descrito en el plan.
export default function NuevoPersonajePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Nuevo personaje</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={crearPersonaje} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre del personaje
              </label>
              <Input id="name" name="name" required autoFocus />
            </div>
            <Button type="submit">Crear ficha</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
