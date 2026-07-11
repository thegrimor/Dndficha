"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { actualizarPersonaje } from "@/actions/personajes";
import { ControlesEdicion } from "@/components/ficha/controles-edicion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FichaPersonaje, Personaje } from "@/types/personaje";

type Objeto = FichaPersonaje["inventory"][number];

function generarId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function BloqueEquipo({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const [inventario, setInventario] = useState<Objeto[]>(() => personaje.sheet.inventory);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");

  function cancelar() {
    setInventario(personaje.sheet.inventory);
    setNuevoNombre("");
    setNuevoTipo("");
    setEditando(false);
  }

  function guardar() {
    iniciarGuardado(async () => {
      const sheet: FichaPersonaje = { ...personaje.sheet, inventory: inventario };
      await actualizarPersonaje(personaje.id, { sheet });
      router.refresh();
      setEditando(false);
    });
  }

  function eliminarObjeto(i: number) {
    setInventario((prev) => prev.filter((_, idx) => idx !== i));
  }

  function anadirObjeto() {
    if (!nuevoNombre.trim()) return;
    setInventario((prev) => [
      ...prev,
      { slug: generarId(), nombre: nuevoNombre.trim(), tipo: nuevoTipo.trim() || "Objeto", fuente: "manual" },
    ]);
    setNuevoNombre("");
    setNuevoTipo("");
  }

  const items = editando ? inventario : personaje.sheet.inventory;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>Equipo</CardTitle>
        {!soloLectura && (
          <div className="flex items-center gap-2">
            <Link
              href={`/buscador/objetos?personaje=${personaje.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Buscar en el SRD
            </Link>
            <ControlesEdicion
              editando={editando}
              guardando={guardando}
              onEditar={() => setEditando(true)}
              onCancelar={cancelar}
              onGuardar={guardar}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Inventario vacío. Añade objetos desde el buscador SRD.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {items.map((objeto, i) => (
              <li key={objeto.slug || i} className="flex items-center justify-between border-b border-border py-1">
                <span>{objeto.nombre}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  {objeto.tipo}
                  {objeto.fuente === "manual" && (
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-xs">Manual</span>
                  )}
                  {editando && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarObjeto(i)}
                      aria-label={`Quitar ${objeto.nombre}`}
                    >
                      Quitar
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        {editando && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="equipo-nuevo-nombre" className="text-xs font-medium uppercase text-muted-foreground">
                Nombre
              </label>
              <Input
                id="equipo-nuevo-nombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej. Cuerda de 15m"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="equipo-nuevo-tipo" className="text-xs font-medium uppercase text-muted-foreground">
                Tipo
              </label>
              <Input
                id="equipo-nuevo-tipo"
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value)}
                placeholder="Ej. Aventura"
              />
            </div>
            <Button type="button" size="sm" onClick={anadirObjeto}>
              Añadir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
