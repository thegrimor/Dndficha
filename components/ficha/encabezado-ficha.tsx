"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { actualizarPersonaje } from "@/actions/personajes";
import { ControlesEdicion } from "@/components/ficha/controles-edicion";
import { Input } from "@/components/ui/input";
import { EDICIONES_DND } from "@/lib/open5e/ediciones";
import type { Personaje } from "@/types/personaje";

interface DatosEncabezado {
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
}

function datosDesdePersonaje(personaje: Personaje): DatosEncabezado {
  return {
    name: personaje.name,
    race: personaje.race ?? "",
    class: personaje.class ?? "",
    level: personaje.level,
    background: personaje.background ?? "",
    alignment: personaje.alignment ?? "",
  };
}

export function EncabezadoFicha({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const idBase = useId();
  const [editando, setEditando] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const [datos, setDatos] = useState<DatosEncabezado>(() => datosDesdePersonaje(personaje));

  function cancelar() {
    setDatos(datosDesdePersonaje(personaje));
    setEditando(false);
  }

  function guardar() {
    iniciarGuardado(async () => {
      await actualizarPersonaje(personaje.id, {
        name: datos.name.trim() || "Sin nombre",
        race: datos.race.trim() || null,
        class: datos.class.trim() || null,
        level: Number.isFinite(datos.level) ? datos.level : 1,
        background: datos.background.trim() || null,
        alignment: datos.alignment.trim() || null,
      });
      router.refresh();
      setEditando(false);
    });
  }

  if (!editando) {
    return (
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold">{personaje.name}</h1>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {EDICIONES_DND.find((e) => e.value === personaje.sheet.edicion)?.label ?? "D&D 5e (2014)"}
            </span>
          </div>
          <p className="text-muted-foreground">
            {personaje.race ?? "Raza sin definir"} · {personaje.class ?? "Clase sin definir"} ·
            Nivel {personaje.level}
            {personaje.background ? ` · ${personaje.background}` : ""}
            {personaje.alignment ? ` · ${personaje.alignment}` : ""}
          </p>
        </div>
        {!soloLectura && (
          <ControlesEdicion
            editando={false}
            guardando={false}
            onEditar={() => setEditando(true)}
            onCancelar={cancelar}
            onGuardar={guardar}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Campo id={`${idBase}-name`} etiqueta="Nombre">
          <Input
            id={`${idBase}-name`}
            value={datos.name}
            onChange={(e) => setDatos((d) => ({ ...d, name: e.target.value }))}
          />
        </Campo>
        <Campo id={`${idBase}-race`} etiqueta="Raza">
          <Input
            id={`${idBase}-race`}
            value={datos.race}
            onChange={(e) => setDatos((d) => ({ ...d, race: e.target.value }))}
          />
        </Campo>
        <Campo id={`${idBase}-class`} etiqueta="Clase">
          <Input
            id={`${idBase}-class`}
            value={datos.class}
            onChange={(e) => setDatos((d) => ({ ...d, class: e.target.value }))}
          />
        </Campo>
        <Campo id={`${idBase}-level`} etiqueta="Nivel">
          <Input
            id={`${idBase}-level`}
            type="number"
            min={1}
            max={20}
            value={datos.level}
            onChange={(e) => setDatos((d) => ({ ...d, level: Number(e.target.value) }))}
          />
        </Campo>
        <Campo id={`${idBase}-background`} etiqueta="Trasfondo">
          <Input
            id={`${idBase}-background`}
            value={datos.background}
            onChange={(e) => setDatos((d) => ({ ...d, background: e.target.value }))}
          />
        </Campo>
        <Campo id={`${idBase}-alignment`} etiqueta="Alineamiento">
          <Input
            id={`${idBase}-alignment`}
            value={datos.alignment}
            onChange={(e) => setDatos((d) => ({ ...d, alignment: e.target.value }))}
          />
        </Campo>
      </div>
      <div>
        <ControlesEdicion
          editando
          guardando={guardando}
          onEditar={() => setEditando(true)}
          onCancelar={cancelar}
          onGuardar={guardar}
        />
      </div>
    </div>
  );
}

function Campo({
  id,
  etiqueta,
  children,
}: {
  id: string;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium uppercase text-muted-foreground">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}
