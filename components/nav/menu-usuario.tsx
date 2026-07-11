"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, ScrollText, UserRound } from "lucide-react";

import { cerrarSesion } from "@/actions/auth";
import { cn } from "@/lib/utils";

interface MenuUsuarioProps {
  nombre: string;
  email: string;
}

export function MenuUsuario({ nombre, email }: MenuUsuarioProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    function alPulsarFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }

    function alPulsarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }

    document.addEventListener("mousedown", alPulsarFuera);
    document.addEventListener("keydown", alPulsarEscape);
    return () => {
      document.removeEventListener("mousedown", alPulsarFuera);
      document.removeEventListener("keydown", alPulsarEscape);
    };
  }, [abierto]);

  const inicial = nombre.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {inicial}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{nombre}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", abierto && "rotate-180")}
        />
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-border bg-card p-1.5 text-sm shadow-lg transition-all",
          abierto
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        <div className="border-b border-border px-2.5 py-2">
          <p className="truncate font-semibold text-foreground">{nombre}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>

        <div className="flex flex-col gap-0.5 py-1.5">
          <Link
            href="/personajes"
            role="menuitem"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary"
          >
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            Mis personajes
          </Link>
          <Link
            href="/perfil"
            role="menuitem"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-secondary"
          >
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Perfil
          </Link>
        </div>

        <form action={cerrarSesion} className="border-t border-border pt-1.5">
          <button
            type="submit"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-destructive transition-colors hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
