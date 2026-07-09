"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { actualizarPersonaje } from "@/actions/personajes";
import { ControlesEdicion } from "@/components/ficha/controles-edicion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FichaPersonaje, Personaje } from "@/types/personaje";

type Rasgo = FichaPersonaje["features"][number];

export function BloqueRasgosCompetencias({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const [rasgos, setRasgos] = useState<Rasgo[]>(() => personaje.sheet.features);
  const [idiomas, setIdiomas] = useState<string[]>(() => personaje.sheet.languages);
  const [nuevoRasgoNombre, setNuevoRasgoNombre] = useState("");
  const [nuevoRasgoDescripcion, setNuevoRasgoDescripcion] = useState("");
  const [nuevoIdioma, setNuevoIdioma] = useState("");

  function cancelar() {
    setRasgos(personaje.sheet.features);
    setIdiomas(personaje.sheet.languages);
    setNuevoRasgoNombre("");
    setNuevoRasgoDescripcion("");
    setNuevoIdioma("");
    setEditando(false);
  }

  function guardar() {
    iniciarGuardado(async () => {
      const sheet: FichaPersonaje = { ...personaje.sheet, features: rasgos, languages: idiomas };
      await actualizarPersonaje(personaje.id, { sheet });
      router.refresh();
      setEditando(false);
    });
  }

  function eliminarRasgo(i: number) {
    setRasgos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function anadirRasgo() {
    if (!nuevoRasgoNombre.trim()) return;
    setRasgos((prev) => [
      ...prev,
      { nombre: nuevoRasgoNombre.trim(), descripcion: nuevoRasgoDescripcion.trim() },
    ]);
    setNuevoRasgoNombre("");
    setNuevoRasgoDescripcion("");
  }

  function eliminarIdioma(i: number) {
    setIdiomas((prev) => prev.filter((_, idx) => idx !== i));
  }

  function anadirIdioma() {
    if (!nuevoIdioma.trim()) return;
    setIdiomas((prev) => [...prev, nuevoIdioma.trim()]);
    setNuevoIdioma("");
  }

  const listaRasgos = editando ? rasgos : personaje.sheet.features;
  const listaIdiomas = editando ? idiomas : personaje.sheet.languages;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Rasgos, competencias e idiomas</CardTitle>
        {!soloLectura && (
          <ControlesEdicion
            editando={editando}
            guardando={guardando}
            onEditar={() => setEditando(true)}
            onCancelar={cancelar}
            onGuardar={guardar}
          />
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div>
          <h4 className="font-medium">Rasgos</h4>
          {listaRasgos.length === 0 ? (
            <p className="text-muted-foreground">Sin rasgos registrados.</p>
          ) : editando ? (
            <ul className="flex flex-col gap-1">
              {listaRasgos.map((rasgo, i) => (
                <li key={i} className="flex items-start justify-between gap-2 border-b border-border py-1">
                  <span>
                    <span className="font-medium">{rasgo.nombre}:</span> {rasgo.descripcion}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarRasgo(i)}
                    aria-label={`Quitar rasgo ${rasgo.nombre}`}
                  >
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="list-inside list-disc">
              {listaRasgos.map((rasgo, i) => (
                <li key={i}>
                  <span className="font-medium">{rasgo.nombre}:</span> {rasgo.descripcion}
                </li>
              ))}
            </ul>
          )}
          {editando && (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex flex-col gap-1 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor="rasgo-nuevo-nombre" className="text-xs font-medium uppercase text-muted-foreground">
                    Nombre
                  </label>
                  <Input
                    id="rasgo-nuevo-nombre"
                    value={nuevoRasgoNombre}
                    onChange={(e) => setNuevoRasgoNombre(e.target.value)}
                    placeholder="Ej. Visión en la oscuridad"
                  />
                </div>
                <div className="flex flex-[2] flex-col gap-1">
                  <label
                    htmlFor="rasgo-nueva-descripcion"
                    className="text-xs font-medium uppercase text-muted-foreground"
                  >
                    Descripción
                  </label>
                  <Input
                    id="rasgo-nueva-descripcion"
                    value={nuevoRasgoDescripcion}
                    onChange={(e) => setNuevoRasgoDescripcion(e.target.value)}
                    placeholder="Descripción breve"
                  />
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={anadirRasgo} className="self-start">
                Añadir rasgo
              </Button>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium">Idiomas</h4>
          {editando ? (
            <ul className="flex flex-wrap gap-2">
              {listaIdiomas.map((idioma, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                >
                  {idioma}
                  <button
                    type="button"
                    onClick={() => eliminarIdioma(i)}
                    aria-label={`Quitar idioma ${idioma}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              {listaIdiomas.length > 0 ? listaIdiomas.join(", ") : "Ninguno registrado."}
            </p>
          )}
          {editando && (
            <div className="mt-2 flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="idioma-nuevo" className="text-xs font-medium uppercase text-muted-foreground">
                  Añadir idioma
                </label>
                <Input
                  id="idioma-nuevo"
                  value={nuevoIdioma}
                  onChange={(e) => setNuevoIdioma(e.target.value)}
                  placeholder="Ej. Élfico"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={anadirIdioma}>
                Añadir
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
