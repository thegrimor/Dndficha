"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { actualizarPersonaje } from "@/actions/personajes";
import { ControlesEdicion } from "@/components/ficha/controles-edicion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FichaPersonaje, Personaje } from "@/types/personaje";

type Ataque = FichaPersonaje["attacks"][number];

export function BloqueAtaques({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const [ataques, setAtaques] = useState<Ataque[]>(() => personaje.sheet.attacks);

  function cancelar() {
    setAtaques(personaje.sheet.attacks);
    setEditando(false);
  }

  function guardar() {
    iniciarGuardado(async () => {
      const sheet: FichaPersonaje = {
        ...personaje.sheet,
        attacks: ataques.filter((a) => a.name.trim().length > 0),
      };
      await actualizarPersonaje(personaje.id, { sheet });
      router.refresh();
      setEditando(false);
    });
  }

  function actualizarFila(i: number, cambios: Partial<Ataque>) {
    setAtaques((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...cambios } : a)));
  }

  function eliminarFila(i: number) {
    setAtaques((prev) => prev.filter((_, idx) => idx !== i));
  }

  function anadirFila() {
    setAtaques((prev) => [...prev, { name: "", bonus: 0, damage: "" }]);
  }

  const filas = editando ? ataques : personaje.sheet.attacks;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Ataques</CardTitle>
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
      <CardContent>
        {filas.length === 0 && !editando ? (
          <p className="text-sm text-muted-foreground">Sin ataques registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-1">Nombre</th>
                <th className="py-1">Bono</th>
                <th className="py-1">Daño</th>
                {editando && <th className="py-1" />}
              </tr>
            </thead>
            <tbody>
              {filas.map((ataque, i) =>
                editando ? (
                  <tr key={i} className="border-t border-border">
                    <td className="py-1 pr-2">
                      <label className="sr-only" htmlFor={`ataque-${i}-nombre`}>
                        Nombre del ataque {i + 1}
                      </label>
                      <Input
                        id={`ataque-${i}-nombre`}
                        value={ataque.name}
                        onChange={(e) => actualizarFila(i, { name: e.target.value })}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <label className="sr-only" htmlFor={`ataque-${i}-bono`}>
                        Bono del ataque {i + 1}
                      </label>
                      <Input
                        id={`ataque-${i}-bono`}
                        type="number"
                        className="w-20"
                        value={ataque.bonus}
                        onChange={(e) => actualizarFila(i, { bonus: Number(e.target.value) })}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <label className="sr-only" htmlFor={`ataque-${i}-dano`}>
                        Daño del ataque {i + 1}
                      </label>
                      <Input
                        id={`ataque-${i}-dano`}
                        value={ataque.damage}
                        onChange={(e) => actualizarFila(i, { damage: e.target.value })}
                      />
                    </td>
                    <td className="py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarFila(i)}
                        aria-label={`Eliminar ataque ${ataque.name || i + 1}`}
                      >
                        Quitar
                      </Button>
                    </td>
                  </tr>
                ) : (
                  <tr key={i} className="border-t border-border">
                    <td className="py-1">{ataque.name}</td>
                    <td className="py-1">{ataque.bonus >= 0 ? `+${ataque.bonus}` : ataque.bonus}</td>
                    <td className="py-1">{ataque.damage}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
        {editando && (
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={anadirFila}>
            Añadir ataque
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
