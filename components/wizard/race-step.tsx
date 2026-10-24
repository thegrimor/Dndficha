"use client";

import { ABILITY_NAMES, type Ability } from "@dndficha/rules";
import { RACES_SRD } from "@dndficha/rules";
import { cn } from "@/lib/utils";
import { OptionCard } from "@/components/wizard/option-card";
import type { WizardData } from "@/components/wizard/types";

function bonusText(fixedBonus: Partial<Record<Ability, number>>): string {
  return Object.entries(fixedBonus)
    .map(([ability, bonus]) => `+${bonus} ${ABILITY_NAMES[ability as Ability]}`)
    .join(", ");
}

export function RaceStep({
  data,
  update,
}: {
  data: WizardData;
  update: (changes: Partial<WizardData>) => void;
}) {
  const race = RACES_SRD.find((r) => r.id === data.raceId);
  const is2024 = data.edition === "2024";
  const label = is2024 ? "especie" : "raza";

  return (
    <div className="flex flex-col gap-4">
      {is2024 && (
        <p className="text-xs text-muted-foreground">
          En 2024 las especies no dan bonificador de característica (lo da el trasfondo).
          Usamos el mismo listado que en 2014 por simplicidad, aunque el PHB 2024 los llama
          &quot;especies&quot; y varía algo el catálogo oficial.
        </p>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {RACES_SRD.map((r) => (
          <OptionCard
            key={r.id}
            selected={r.id === data.raceId}
            onClick={() =>
              update({
                raceId: r.id,
                raceAbilityChoices: [],
              })
            }
            title={r.name}
            subtitle={is2024 ? "Sin bonificador (lo da el trasfondo)" : bonusText(r.fixedBonus)}
          >
            <span className="text-xs text-muted-foreground">
              Velocidad {r.speed} pies · Idiomas: {r.languages.join(", ")}
            </span>
          </OptionCard>
        ))}
      </div>

      {race && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-1 font-medium">
            Rasgos de {race.name} <span className="font-normal text-muted-foreground">({label})</span>
          </h4>
          <ul className="list-inside list-disc text-muted-foreground">
            {race.features.map((feature) => (
              <li key={feature.name}>
                <span className="font-medium text-foreground">{feature.name}:</span> {feature.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!is2024 && race?.freeChoice && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-2 font-medium">
            Elige {race.freeChoice.count} característica(s) que reciben +{race.freeChoice.value}
          </h4>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ABILITY_NAMES) as Ability[])
              .filter((ability) => !race.freeChoice?.exclude?.includes(ability))
              .map((ability) => {
                const checked = data.raceAbilityChoices.includes(ability);
                const limitReached =
                  data.raceAbilityChoices.length >= (race.freeChoice?.count ?? 0);
                return (
                  <label
                    key={ability}
                    className={cn(
                      "flex items-center gap-1.5",
                      !checked && limitReached && "opacity-40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && limitReached}
                      onChange={() => {
                        const nextSelection = checked
                          ? data.raceAbilityChoices.filter((c) => c !== ability)
                          : [...data.raceAbilityChoices, ability];
                        update({ raceAbilityChoices: nextSelection });
                      }}
                      className="h-4 w-4 rounded border-border"
                    />
                    {ABILITY_NAMES[ability]}
                  </label>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
