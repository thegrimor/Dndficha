"use client";

import { ABILITIES, ABILITY_NAMES, type Ability } from "@dndficha/rules";
import { signedModifier } from "@dndficha/rules";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { STANDARD_ARRAY, type WizardData, type ScoreMethod } from "@/components/wizard/types";

const UNASSIGNED = 0;

export function ScoresStep({
  data,
  update,
}: {
  data: WizardData;
  update: (changes: Partial<WizardData>) => void;
}) {
  function changeMethod(method: ScoreMethod) {
    update({
      scoreMethod: method,
      baseScores:
        method === "array"
          ? { str: UNASSIGNED, dex: UNASSIGNED, con: UNASSIGNED, int: UNASSIGNED, wis: UNASSIGNED, cha: UNASSIGNED }
          : { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    });
  }

  function assignArrayValue(ability: Ability, value: number) {
    update({ baseScores: { ...data.baseScores, [ability]: value } });
  }

  function assignManualValue(ability: Ability, value: number) {
    update({ baseScores: { ...data.baseScores, [ability]: value } });
  }

  const usedValues = ABILITIES.map((ability) => data.baseScores[ability]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(["array", "manual"] as const).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => changeMethod(method)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium",
              data.scoreMethod === method
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-secondary"
            )}
          >
            {method === "array" ? "Array estándar" : "Tirada manual"}
          </button>
        ))}
      </div>

      {data.scoreMethod === "array" ? (
        <p className="text-sm text-muted-foreground">
          Asigna cada valor de {STANDARD_ARRAY.join(", ")} a una característica distinta.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Introduce el resultado de tus tiradas (por ejemplo 4d6 quita el menor) para cada característica.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ABILITIES.map((ability) => {
          const value = data.baseScores[ability];
          return (
            <div key={ability} className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3">
              <label className="text-sm font-medium">{ABILITY_NAMES[ability]}</label>
              {data.scoreMethod === "array" ? (
                <select
                  value={value === UNASSIGNED ? "" : value}
                  onChange={(e) => assignArrayValue(ability, e.target.value ? Number(e.target.value) : UNASSIGNED)}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- Elegir --</option>
                  {STANDARD_ARRAY.map((v) => (
                    <option key={v} value={v} disabled={usedValues.includes(v) && value !== v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={value}
                  onChange={(e) => assignManualValue(ability, Number(e.target.value))}
                />
              )}
              {value > 0 && (
                <span className="text-xs text-muted-foreground">Modificador {signedModifier(value)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
