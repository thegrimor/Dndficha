import Link from "next/link";
import { Sword } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { QueryProvider } from "@/components/providers/query-provider";
import { PersonajeActivoProvider } from "@/components/providers/personaje-activo-provider";
import { SelectorPersonajeActivo } from "@/components/nav/selector-personaje-activo";
import { MenuUsuario } from "@/components/nav/menu-usuario";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  const nombre = (user?.user_metadata?.username as string | undefined) || email || "Aventurero";

  return (
    <QueryProvider>
      <PersonajeActivoProvider>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border bg-background/80 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between gap-4">
              <Link href="/personajes" className="flex items-center gap-2 font-semibold tracking-tight">
                <Sword className="h-5 w-5 text-primary" />
                Dndficha
              </Link>
              <nav className="flex items-center gap-5 text-sm">
                <Link href="/buscador/hechizos" className="text-muted-foreground transition-colors hover:text-foreground">
                  Hechizos
                </Link>
                <Link href="/buscador/objetos" className="text-muted-foreground transition-colors hover:text-foreground">
                  Objetos
                </Link>
                <MenuUsuario nombre={nombre} email={email} />
              </nav>
            </div>
            <SelectorPersonajeActivo />
          </header>
          <main className="flex flex-1 flex-col p-6">{children}</main>
        </div>
      </PersonajeActivoProvider>
    </QueryProvider>
  );
}
