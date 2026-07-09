import Link from "next/link";

import { cerrarSesion } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { QueryProvider } from "@/components/providers/query-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <Link href="/personajes" className="font-semibold">
            Dndficha
          </Link>
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
    </QueryProvider>
  );
}
