"use client";

import { SKILLS, ABILITY_NAMES } from "@dndficha/rules";
import { CLASSES_SRD } from "@dndficha/rules";
import { cn } from "@/lib/utils";
import { OptionCard } from "@/components/wizard/option-card";
import type { WizardData } from "@/components/wizard/types";

export function ClassStep({
  data,
  update,
}: {
  data: WizardData;
  update: (changes: Partial<WizardData>) => void;
}) {
  const characterClass = CLASSES_SRD.find((c) => c.id === data.classId);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CLASSES_SRD.map((c) => (
          <OptionCard
            key={c.id}
            selected={c.id === data.classId}
            onClick={() => update({ classId: c.id, chosenClassSkills: [] })}
            title={c.name}
            subtitle={`Dado de golpe d${c.hitDie}`}
          >
            <span className="text-xs text-muted-foreground">
              Salvaciones: {c.savingThrowProficiencies.map((s) => ABILITY_NAMES[s]).join(", ")}
              {c.spellcastingAbility && (
                <> · Conjuro: {ABILITY_NAMES[c.spellcastingAbility]}</>
              )}
            </span>
          </OptionCard>
        ))}
      </div>

      {characterClass && (
        <>
          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            <h4 className="mb-1 font-medium">Rasgos de nivel 1 de {characterClass.name}</h4>
            <ul className="list-inside list-disc text-muted-foreground">
              {characterClass.level1Features.map((feature) => (
                <li key={feature.name}>
                  <span className="font-medium text-foreground">{feature.name}:</span> {feature.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            <h4 className="mb-2 font-medium">
              Elige {characterClass.skillChoiceCount} habilidad(es) competentes
              {" "}
              ({data.chosenClassSkills.length}/{characterClass.skillChoiceCount})
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {characterClass.availableSkills.map((skillId) => {
                const skill = SKILLS.find((h) => h.id === skillId);
                if (!skill) return null;
                const checked = data.chosenClassSkills.includes(skillId);
                const limitReached =
                  data.chosenClassSkills.length >= characterClass.skillChoiceCount;
                return (
                  <label
                    key={skillId}
                    className={cn(
                      "flex items-center gap-1.5 text-sm",
                      !checked && limitReached && "opacity-40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && limitReached}
                      onChange={() => {
                        const nextSelection = checked
                          ? data.chosenClassSkills.filter((h) => h !== skillId)
                          : [...data.chosenClassSkills, skillId];
                        update({ chosenClassSkills: nextSelection });
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                    {skill.name}
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
