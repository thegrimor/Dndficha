"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateCharacter } from "@/actions/characters";
import { EditControls } from "@/components/sheet/edit-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { bonusWithProficiency, signedModifier } from "@dndficha/rules";
import { ABILITIES, ABILITY_NAMES } from "@dndficha/rules";
import type { CharacterSheet, CharacterDto } from "@dndficha/rules";

export function AbilitiesBlock({
  character,
  readOnly = false,
}: {
  character: CharacterDto;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const idBase = useId();
  const level = character.level;
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const [abilityScores, setAbilityScores] = useState(
    () => character.sheet.abilityScores
  );
  const [savingThrows, setSavingThrows] = useState(
    () => character.sheet.savingThrows
  );

  function cancel() {
    setAbilityScores(character.sheet.abilityScores);
    setSavingThrows(character.sheet.savingThrows);
    setEditing(false);
  }

  function save() {
    startSaving(async () => {
      const sheet: CharacterSheet = { ...character.sheet, abilityScores, savingThrows };
      await updateCharacter(character.id, { sheet });
      router.refresh();
      setEditing(false);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {!readOnly && (
        <div className="flex justify-end">
          <EditControls
            editing={editing}
            saving={saving}
            onEdit={() => setEditing(true)}
            onCancel={cancel}
            onSave={save}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITIES.map((ability) => {
          const score = editing ? abilityScores[ability] : character.sheet.abilityScores[ability];
          const hasSave = editing
            ? Boolean(savingThrows[ability]?.proficient)
            : Boolean(character.sheet.savingThrows[ability]?.proficient);
          const save = bonusWithProficiency(score, level, hasSave);

          if (!editing) {
            return (
              <Card key={ability} className="text-center">
                <CardContent className="flex flex-col items-center gap-1 p-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {ABILITY_NAMES[ability]}
                  </span>
                  <span className="text-2xl font-bold">{score}</span>
                  <span className="text-sm text-muted-foreground">
                    {signedModifier(score)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Salv. {save >= 0 ? `+${save}` : save}
                    {hasSave ? " •" : ""}
                  </span>
                </CardContent>
              </Card>
            );
          }

          const inputId = `${idBase}-${ability}`;
          const checkboxId = `${idBase}-${ability}-salv`;

          return (
            <Card key={ability} className="text-center">
              <CardContent className="flex flex-col items-center gap-2 p-3">
                <label htmlFor={inputId} className="text-xs font-medium uppercase text-muted-foreground">
                  {ABILITY_NAMES[ability]}
                </label>
                <Input
                  id={inputId}
                  type="number"
                  min={1}
                  max={30}
                  className="h-9 w-16 text-center"
                  value={abilityScores[ability]}
                  onChange={(e) =>
                    setAbilityScores((prev) => ({ ...prev, [ability]: Number(e.target.value) }))
                  }
                />
                <span className="text-xs text-muted-foreground">
                  {signedModifier(abilityScores[ability])}
                </span>
                <label htmlFor={checkboxId} className="flex items-center gap-1 text-xs">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={Boolean(savingThrows[ability]?.proficient)}
                    onChange={(e) =>
                      setSavingThrows((prev) => ({
                        ...prev,
                        [ability]: { proficient: e.target.checked },
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
