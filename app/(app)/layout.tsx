import Link from "next/link";
import { Sword } from "lucide-react";

import { currentUser } from "@/lib/api/user";
import { QueryProvider } from "@/components/providers/query-provider";
import { ActiveCharacterProvider } from "@/components/providers/active-character-provider";
import { ActiveCharacterSelector } from "@/components/nav/active-character-selector";
import { UserMenu } from "@/components/nav/user-menu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();

  const email = user.email;
  const name = user.username || email || "Aventurero";

  return (
    <QueryProvider>
      <ActiveCharacterProvider>
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
                <UserMenu name={name} email={email} />
              </nav>
            </div>
            <ActiveCharacterSelector />
          </header>
          <main className="flex flex-1 flex-col p-6">{children}</main>
        </div>
      </ActiveCharacterProvider>
    </QueryProvider>
  );
}
