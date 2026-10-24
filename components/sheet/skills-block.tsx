"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateCharacter } from "@/actions/characters";
import { EditControls } from "@/components/sheet/edit-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bonusWithProficiency } from "@dndficha/rules";
import { SKILLS } from "@dndficha/rules";
import type { CharacterSheet, CharacterDto } from "@dndficha/rules";

type Skills = CharacterSheet["skills"];

export function SkillsBlock({
  character,
  readOnly = false,
}: {
  character: CharacterDto;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const level = character.level;
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const [skills, setSkills] = useState<Skills>(() => character.sheet.skills);

  function cancel() {
    setSkills(character.sheet.skills);
    setEditing(false);
  }

  function save() {
    startSaving(async () => {
      const sheet: CharacterSheet = { ...character.sheet, skills };
      await updateCharacter(character.id, { sheet });
      router.refresh();
      setEditing(false);
    });
  }

  const current = editing ? skills : character.sheet.skills;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Habilidades</CardTitle>
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
      <CardContent className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {SKILLS.map((skill) => {
          const state = current[skill.id];
          const score = character.sheet.abilityScores[skill.ability];
          const bonus = bonusWithProficiency(
            score,
            level,
            Boolean(state?.proficient),
            Boolean(state?.expertise)
          );

          if (!editing) {
            return (
              <div
                key={skill.id}
                className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-secondary"
              >
                <span>
                  {state?.proficient ? "●" : "○"} {skill.name}{" "}
                  <span className="text-muted-foreground">({skill.ability})</span>
                </span>
                <span className="font-medium">{bonus >= 0 ? `+${bonus}` : bonus}</span>
              </div>
            );
          }

          return (
            <div
              key={skill.id}
              className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm"
            >
              <span className="flex-1">
                {skill.name}{" "}
                <span className="text-muted-foreground">({skill.ability})</span>
              </span>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={Boolean(state?.proficient)}
                  onChange={(e) =>
                    setSkills((prev) => ({
                      ...prev,
                      [skill.id]: {
                        proficient: e.target.checked,
                        expertise: e.target.checked ? prev[skill.id]?.expertise : false,
                      },
                    }))
                  }
                />
                Comp.
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  disabled={!state?.proficient}
                  checked={Boolean(state?.expertise)}
                  onChange={(e) =>
                    setSkills((prev) => ({
                      ...prev,
                      [skill.id]: {
                        proficient: Boolean(prev[skill.id]?.proficient),
                        expertise: e.target.checked,
                      },
                    }))
                  }
                />
                Pericia
              </label>
              <span className="w-8 text-right font-medium">{bonus >= 0 ? `+${bonus}` : bonus}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
