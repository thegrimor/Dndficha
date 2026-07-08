import Link from "next/link";

import { listarPersonajes } from "@/actions/personajes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function PersonajesPage() {
  const personajes = await listarPersonajes();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis personajes</h1>
        <Link href="/personajes/nuevo" className={buttonVariants()}>
          + Nuevo personaje
        </Link>
      </div>

      {personajes.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no tienes ninguna ficha. Crea tu primer personaje para empezar.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personajes.map((personaje) => (
            <Link key={personaje.id} href={`/personajes/${personaje.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{personaje.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {personaje.race ?? "Raza sin definir"} ·{" "}
                  {personaje.class ?? "Clase sin definir"} · Nivel {personaje.level}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
