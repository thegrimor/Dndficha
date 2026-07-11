import Link from "next/link";
import { BookOpen, ScrollText, Sparkles, Sword } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const caracteristicas = [
  {
    icono: ScrollText,
    titulo: "Fichas completas",
    descripcion: "Crea y edita fichas de personaje de D&D 5e con cálculos automáticos de estadísticas.",
  },
  {
    icono: BookOpen,
    titulo: "Buscador integrado",
    descripcion: "Consulta hechizos y objetos del SRD y añádelos a tu ficha en un par de clics.",
  },
  {
    icono: Sparkles,
    titulo: "Siempre a mano",
    descripcion: "Tus personajes se guardan en la nube y están disponibles desde cualquier dispositivo.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-16 p-6 py-16 text-center">
      <div className="flex flex-col items-center gap-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sword className="h-7 w-7" />
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Dndficha</h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Crea, edita y consulta fichas de personaje de D&D 5e desde cualquier
          dispositivo, con un buscador integrado de hechizos y objetos del SRD.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/registro" className={buttonVariants({ size: "lg" })}>
            Crear cuenta
          </Link>
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Iniciar sesión
          </Link>
        </div>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {caracteristicas.map(({ icono: Icono, titulo, descripcion }) => (
          <Card key={titulo} className="text-left">
            <CardContent className="flex flex-col gap-2 p-5">
              <Icono className="h-5 w-5 text-accent" />
              <h2 className="font-semibold">{titulo}</h2>
              <p className="text-sm text-muted-foreground">{descripcion}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
