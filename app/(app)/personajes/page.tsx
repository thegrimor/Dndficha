import Link from "next/link";
import { ScrollText, Sparkles } from "lucide-react";

import { listarPersonajes } from "@/actions/personajes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function PersonajesPage() {
  const personajes = await listarPersonajes();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Mis personajes</h1>
        <Link href="/personajes/nuevo" className={buttonVariants()}>
          <Sparkles className="h-4 w-4" />
          Nuevo personaje
        </Link>
      </div>

      {personajes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <ScrollText className="h-10 w-10 text-muted-foreground" />
          <p className="max-w-sm text-muted-foreground">
            Todavía no tienes ninguna ficha. Crea tu primer personaje para empezar tu aventura.
          </p>
          <Link href="/personajes/nuevo" className={buttonVariants({ className: "mt-2" })}>
            Crear mi primer personaje
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personajes.map((personaje) => (
            <Link key={personaje.id} href={`/personajes/${personaje.id}`}>
              <Card className="group h-full transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardHeader className="gap-1">
                  <span className="inline-flex w-fit items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    Nivel {personaje.level}
                  </span>
                  <CardTitle className="text-base normal-case tracking-normal text-foreground group-hover:text-primary">
                    {personaje.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {personaje.race ?? "Raza sin definir"} · {personaje.class ?? "Clase sin definir"}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
