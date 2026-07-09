"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { actualizarPersonaje } from "@/actions/personajes";
import { ControlesEdicion } from "@/components/ficha/controles-edicion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { bonoConCompetencia, modificadorConSigno } from "@/lib/dnd/calculos";
import { CARACTERISTICAS, NOMBRES_CARACTERISTICAS } from "@/lib/dnd/constantes";
import type { FichaPersonaje, Personaje } from "@/types/personaje";

export function BloqueCaracteristicas({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const idBase = useId();
  const nivel = personaje.level;
  const [editando, setEditando] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const [abilityScores, setAbilityScores] = useState(
    () => personaje.sheet.abilityScores
  );
  const [savingThrows, setSavingThrows] = useState(
    () => personaje.sheet.savingThrows
  );

  function cancelar() {
    setAbilityScores(personaje.sheet.abilityScores);
    setSavingThrows(personaje.sheet.savingThrows);
    setEditando(false);
  }

  function guardar() {
    iniciarGuardado(async () => {
      const sheet: FichaPersonaje = { ...personaje.sheet, abilityScores, savingThrows };
      await actualizarPersonaje(personaje.id, { sheet });
      router.refresh();
      setEditando(false);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {!soloLectura && (
        <div className="flex justify-end">
          <ControlesEdicion
            editando={editando}
            guardando={guardando}
            onEditar={() => setEditando(true)}
            onCancelar={cancelar}
            onGuardar={guardar}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CARACTERISTICAS.map((car) => {
          const puntuacion = editando ? abilityScores[car] : personaje.sheet.abilityScores[car];
          const tieneSalvacion = editando
            ? Boolean(savingThrows[car]?.proficient)
            : Boolean(personaje.sheet.savingThrows[car]?.proficient);
          const salvacion = bonoConCompetencia(puntuacion, nivel, tieneSalvacion);

          if (!editando) {
            return (
              <Card key={car} className="text-center">
                <CardContent className="flex flex-col items-center gap-1 p-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {NOMBRES_CARACTERISTICAS[car]}
                  </span>
                  <span className="text-2xl font-bold">{puntuacion}</span>
                  <span className="text-sm text-muted-foreground">
                    {modificadorConSigno(puntuacion)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Salv. {salvacion >= 0 ? `+${salvacion}` : salvacion}
                    {tieneSalvacion ? " •" : ""}
                  </span>
                </CardContent>
              </Card>
            );
          }

          const inputId = `${idBase}-${car}`;
          const checkboxId = `${idBase}-${car}-salv`;

          return (
            <Card key={car} className="text-center">
              <CardContent className="flex flex-col items-center gap-2 p-3">
                <label htmlFor={inputId} className="text-xs font-medium uppercase text-muted-foreground">
                  {NOMBRES_CARACTERISTICAS[car]}
                </label>
                <Input
                  id={inputId}
                  type="number"
                  min={1}
                  max={30}
                  className="h-9 w-16 text-center"
                  value={abilityScores[car]}
                  onChange={(e) =>
                    setAbilityScores((prev) => ({ ...prev, [car]: Number(e.target.value) }))
                  }
                />
                <span className="text-xs text-muted-foreground">
                  {modificadorConSigno(abilityScores[car])}
                </span>
                <label htmlFor={checkboxId} className="flex items-center gap-1 text-xs">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={Boolean(savingThrows[car]?.proficient)}
                    onChange={(e) =>
                      setSavingThrows((prev) => ({
                        ...prev,
                        [car]: { proficient: e.target.checked },
                      }))
                    }
                  />
                  Salvación
                </label>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
