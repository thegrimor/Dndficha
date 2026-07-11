import Link from "next/link";

import { cerrarSesion } from "@/actions/auth";
import { listarPersonajes } from "@/actions/personajes";
import { Button } from "@/components/ui/button";
import { QueryProvider } from "@/components/providers/query-provider";
import { PersonajeActivoProvider } from "@/components/providers/personaje-activo-provider";
import { SelectorPersonajeActivo } from "@/components/nav/selector-personaje-activo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const personajes = await listarPersonajes();

  return (
    <QueryProvider>
      <PersonajeActivoProvider>
        <div className="flex min-h-screen flex-col">
          <header className="flex flex-col gap-3 border-b border-border px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/personajes" className="font-semibold">
                Dndficha
              </Link>
              <SelectorPersonajeActivo personajes={personajes} />
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/personajes" className="hover:underline">
                Mis personajes
              </Link>
              <Link href="/buscador/hechizos" className="hover:underline">
                Hechizos
              </Link>
              <Link href="/buscador/objetos" className="hover:underline">
                Objetos
              </Link>
              <form action={cerrarSesion}>
                <Button type="submit" variant="ghost" size="sm">
                  Cerrar sesión
                </Button>
              </form>
            </nav>
          </header>
          <main className="flex flex-1 flex-col p-6">{children}</main>
        </div>
      </PersonajeActivoProvider>
    </QueryProvider>
  );
}
