"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { actualizarPersonaje } from "@/actions/personajes";
import { ControlesEdicion } from "@/components/ficha/controles-edicion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bonoConCompetencia } from "@/lib/dnd/calculos";
import { HABILIDADES } from "@/lib/dnd/constantes";
import type { FichaPersonaje, Personaje } from "@/types/personaje";

type Skills = FichaPersonaje["skills"];

export function BloqueHabilidades({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const nivel = personaje.level;
  const [editando, setEditando] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const [skills, setSkills] = useState<Skills>(() => personaje.sheet.skills);

  function cancelar() {
    setSkills(personaje.sheet.skills);
    setEditando(false);
  }

  function guardar() {
    iniciarGuardado(async () => {
      const sheet: FichaPersonaje = { ...personaje.sheet, skills };
      await actualizarPersonaje(personaje.id, { sheet });
      router.refresh();
      setEditando(false);
    });
  }

  const actual = editando ? skills : personaje.sheet.skills;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Habilidades</CardTitle>
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
      <CardContent className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {HABILIDADES.map((habilidad) => {
          const estado = actual[habilidad.id];
          const puntuacion = personaje.sheet.abilityScores[habilidad.caracteristica];
          const bono = bonoConCompetencia(
            puntuacion,
            nivel,
            Boolean(estado?.proficient),
            Boolean(estado?.expertise)
          );

          if (!editando) {
            return (
              <div
                key={habilidad.id}
                className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-secondary"
              >
                <span>
                  {estado?.proficient ? "●" : "○"} {habilidad.nombre}{" "}
                  <span className="text-muted-foreground">({habilidad.caracteristica})</span>
                </span>
                <span className="font-medium">{bono >= 0 ? `+${bono}` : bono}</span>
              </div>
            );
          }

          return (
            <div
              key={habilidad.id}
              className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm"
            >
              <span className="flex-1">
                {habilidad.nombre}{" "}
                <span className="text-muted-foreground">({habilidad.caracteristica})</span>
              </span>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={Boolean(estado?.proficient)}
                  onChange={(e) =>
                    setSkills((prev) => ({
                      ...prev,
                      [habilidad.id]: {
                        proficient: e.target.checked,
                        expertise: e.target.checked ? prev[habilidad.id]?.expertise : false,
                      },
                    }))
                  }
                />
                Comp.
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  disabled={!estado?.proficient}
                  checked={Boolean(estado?.expertise)}
                  onChange={(e) =>
                    setSkills((prev) => ({
                      ...prev,
                      [habilidad.id]: {
                        proficient: Boolean(prev[habilidad.id]?.proficient),
                        expertise: e.target.checked,
                      },
                    }))
                  }
                />
                Pericia
              </label>
              <span className="w-8 text-right font-medium">{bono >= 0 ? `+${bono}` : bono}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
