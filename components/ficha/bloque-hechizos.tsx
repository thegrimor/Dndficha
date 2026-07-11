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

type Hechizo = FichaPersonaje["spells"]["known"][number];

function generarId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function BloqueHechizos({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const [conocidos, setConocidos] = useState<Hechizo[]>(() => personaje.sheet.spells.known);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoNivel, setNuevoNivel] = useState(0);

  function cancelar() {
    setConocidos(personaje.sheet.spells.known);
    setNuevoNombre("");
    setNuevoNivel(0);
    setEditando(false);
  }

  function guardar() {
    iniciarGuardado(async () => {
      const sheet: FichaPersonaje = {
        ...personaje.sheet,
        spells: { ...personaje.sheet.spells, known: conocidos },
      };
      await actualizarPersonaje(personaje.id, { sheet });
      router.refresh();
      setEditando(false);
    });
  }

  function alternarPreparado(i: number) {
    setConocidos((prev) =>
      prev.map((h, idx) => (idx === i ? { ...h, prepared: !h.prepared } : h))
    );
  }

  function eliminarHechizo(i: number) {
    setConocidos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function anadirHechizo() {
    if (!nuevoNombre.trim()) return;
    setConocidos((prev) => [
      ...prev,
      {
        slug: generarId(),
        nombre: nuevoNombre.trim(),
        nivel: nuevoNivel,
        fuente: "manual",
        prepared: false,
      },
    ]);
    setNuevoNombre("");
    setNuevoNivel(0);
  }

  const lista = editando ? conocidos : personaje.sheet.spells.known;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>Hechizos</CardTitle>
        {!soloLectura && (
          <div className="flex items-center gap-2">
            <Link
              href={`/buscador/hechizos?personaje=${personaje.id}`}
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
        {lista.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin hechizos conocidos todavía. Búscalos en el catálogo SRD.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {lista.map((hechizo, i) => (
              <li key={hechizo.slug || i} className="flex items-center justify-between border-b border-border py-1">
                {editando ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(hechizo.prepared)}
                      onChange={() => alternarPreparado(i)}
                    />
                    {hechizo.nombre}
                  </label>
                ) : (
                  <span>
                    {hechizo.prepared ? "●" : "○"} {hechizo.nombre}
                  </span>
                )}
                <span className="flex items-center gap-2 text-muted-foreground">
                  Nivel {hechizo.nivel}
                  {editando && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarHechizo(i)}
                      aria-label={`Quitar ${hechizo.nombre}`}
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
              <label htmlFor="hechizo-nuevo-nombre" className="text-xs font-medium uppercase text-muted-foreground">
                Nombre
              </label>
              <Input
                id="hechizo-nuevo-nombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej. Bola de fuego"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="hechizo-nuevo-nivel" className="text-xs font-medium uppercase text-muted-foreground">
                Nivel
              </label>
              <Input
                id="hechizo-nuevo-nivel"
                type="number"
                min={0}
                max={9}
                className="w-20"
                value={nuevoNivel}
                onChange={(e) => setNuevoNivel(Number(e.target.value))}
              />
            </div>
            <Button type="button" size="sm" onClick={anadirHechizo}>
              Añadir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
