import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">Dndficha</h1>
      <p className="max-w-md text-muted-foreground">
        Crea, edita y consulta fichas de personaje de D&D 5e desde cualquier
        dispositivo, con un buscador integrado de hechizos y objetos del SRD.
      </p>
      <div className="flex gap-3">
        <Link href="/registro" className={buttonVariants({ size: "lg" })}>
          Crear cuenta
        </Link>
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
