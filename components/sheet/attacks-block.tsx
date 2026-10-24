"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateCharacter } from "@/actions/characters";
import { EditControls } from "@/components/sheet/edit-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CharacterSheet, CharacterDto } from "@dndficha/rules";

type Attack = CharacterSheet["attacks"][number];

export function AttacksBlock({
  character,
  readOnly = false,
}: {
  character: CharacterDto;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const [attacks, setAttacks] = useState<Attack[]>(() => character.sheet.attacks);

  function cancel() {
    setAttacks(character.sheet.attacks);
    setEditing(false);
  }

  function save() {
    startSaving(async () => {
      const sheet: CharacterSheet = {
        ...character.sheet,
        attacks: attacks.filter((a) => a.name.trim().length > 0),
      };
      await updateCharacter(character.id, { sheet });
      router.refresh();
      setEditing(false);
    });
  }

  function updateRow(i: number, changes: Partial<Attack>) {
    setAttacks((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...changes } : a)));
  }

  function deleteRow(i: number) {
    setAttacks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addRow() {
    setAttacks((prev) => [...prev, { name: "", bonus: 0, damage: "" }]);
  }

  const rows = editing ? attacks : character.sheet.attacks;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Ataques</CardTitle>
        {!readOnly && (
          <EditControls
            editing={editing}
            saving={saving}
            onEdit={() => setEditing(true)}
            onCancel={cancel}
            onSave={save}
          />
        )}
      </CardHeader>
      <CardContent>
        {rows.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground">Sin ataques registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-1">Nombre</th>
                <th className="py-1">Bono</th>
                <th className="py-1">Daño</th>
                {editing && <th className="py-1" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((attack, i) =>
                editing ? (
                  <tr key={i} className="border-t border-border">
                    <td className="py-1 pr-2">
                      <label className="sr-only" htmlFor={`ataque-${i}-nombre`}>
                        Nombre del ataque {i + 1}
                      </label>
                      <Input
                        id={`ataque-${i}-nombre`}
                        value={attack.name}
                        onChange={(e) => updateRow(i, { name: e.target.value })}
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
                        value={attack.bonus}
                        onChange={(e) => updateRow(i, { bonus: Number(e.target.value) })}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <label className="sr-only" htmlFor={`ataque-${i}-dano`}>
                        Daño del ataque {i + 1}
                      </label>
                      <Input
                        id={`ataque-${i}-dano`}
                        value={attack.damage}
                        onChange={(e) => updateRow(i, { damage: e.target.value })}
                      />
                    </td>
                    <td className="py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRow(i)}
                        aria-label={`Eliminar ataque ${attack.name || i + 1}`}
                      >
                        Quitar
                      </Button>
                    </td>
                  </tr>
                ) : (
                  <tr key={i} className="border-t border-border">
                    <td className="py-1">{attack.name}</td>
                    <td className="py-1">{attack.bonus >= 0 ? `+${attack.bonus}` : attack.bonus}</td>
                    <td className="py-1">{attack.damage}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
        {editing && (
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addRow}>
            Añadir ataque
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
