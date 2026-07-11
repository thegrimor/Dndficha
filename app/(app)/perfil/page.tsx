import Link from "next/link";
import { Mail, ScrollText, UserRound } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { listarPersonajes } from "@/actions/personajes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const personajes = await listarPersonajes();

  const email = user?.email ?? "";
  const nombre = (user?.user_metadata?.username as string | undefined) || email || "Aventurero";
  const miembroDesde = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
  const inicial = nombre.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
            {inicial}
          </span>
          <div className="flex flex-col gap-0.5">
            <CardTitle className="text-base normal-case tracking-normal">{nombre}</CardTitle>
            {miembroDesde && <p className="text-sm text-muted-foreground">Miembro desde el {miembroDesde}</p>}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2.5">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Correo</span>
              <span className="text-sm font-medium">{email}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2.5">
            <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Nombre de usuario</span>
              <span className="text-sm font-medium">{nombre}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2.5">
            <ScrollText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Personajes creados</span>
              <span className="text-sm font-medium">{personajes.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link href="/personajes" className={buttonVariants({ variant: "outline" })}>
        Volver a mis personajes
      </Link>
    </div>
  );
}
