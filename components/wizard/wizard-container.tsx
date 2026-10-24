"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";

import { createCharacterFromWizard } from "@/actions/wizard";
import { ABILITIES } from "@dndficha/rules";
import { CLASSES_SRD, RACES_SRD } from "@dndficha/rules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { STANDARD_ARRAY, initialWizardData } from "@/components/wizard/types";
import { EditionStep } from "@/components/wizard/edition-step";
import { RaceStep } from "@/components/wizard/race-step";
import { ClassStep } from "@/components/wizard/class-step";
import { BackgroundStep } from "@/components/wizard/background-step";
import { ScoresStep } from "@/components/wizard/scores-step";
import { SummaryStep } from "@/components/wizard/summary-step";

export function WizardContainer() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialWizardData());
  const steps = [
    "Edición",
    data.edition === "2024" ? "Especie" : "Raza",
    "Clase",
    "Trasfondo",
    "Puntuaciones",
    "Resumen",
  ] as const;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update(changes: Partial<typeof data>) {
    setData((prev) => ({ ...prev, ...changes }));
  }

  const canAdvance = canAdvanceStep(step, data);

  function confirm() {
    setError(null);
    startTransition(async () => {
      try {
        await createCharacterFromWizard(data);
      } catch (err) {
        unstable_rethrow(err);
        setError(err instanceof Error ? err.message : "No se pudo crear el personaje.");
      }
    });
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Nuevo personaje</CardTitle>
        <div className="flex flex-wrap gap-2 pt-1">
          {steps.map((stepName, index) => (
            <span
              key={stepName}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                index === step
                  ? "bg-primary text-primary-foreground"
                  : index < step
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground"
              )}
            >
              {index + 1}. {stepName}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="character-name" className="text-sm font-medium">
            Nombre del personaje
          </label>
          <Input
            id="character-name"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Ej. Elara Lunanoche"
            autoFocus
          />
        </div>

        {step === 0 && <EditionStep data={data} update={update} />}
        {step === 1 && <RaceStep data={data} update={update} />}
        {step === 2 && <ClassStep data={data} update={update} />}
        {step === 3 && <BackgroundStep data={data} update={update} />}
        {step === 4 && <ScoresStep data={data} update={update} />}
        {step === 5 && <SummaryStep data={data} />}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((p) => Math.max(0, p - 1))}
          >
            Anterior
          </Button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep((p) => Math.min(steps.length - 1, p + 1))}
            >
              Siguiente
            </Button>
          ) : (
            <Button type="button" disabled={pending} onClick={confirm}>
              {pending ? "Creando..." : "Confirmar y crear"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function canAdvanceStep(step: number, data: ReturnType<typeof initialWizardData>): boolean {
  if (step === 0) {
    return Boolean(data.edition);
  }

  if (step === 1) {
    if (!data.name.trim() || !data.raceId) return false;
    const race = RACES_SRD.find((r) => r.id === data.raceId);
    if (!race) return false;
    if (
      data.edition === "2014" &&
      race.freeChoice &&
      data.raceAbilityChoices.length !== race.freeChoice.count
    ) {
      return false;
    }
    return true;
  }

  if (step === 2) {
    const characterClass = CLASSES_SRD.find((c) => c.id === data.classId);
    if (!characterClass) return false;
    return data.chosenClassSkills.length === characterClass.skillChoiceCount;
  }

  if (step === 3) {
    const background = data.backgroundData;
    if (!background) return false;
    if (data.chosenBackgroundLanguages.length !== background.languageChoiceCount) return false;
    if (data.edition === "2024" && background.abilityBonusOptions && data.backgroundBonus.mode === "split") {
      const { plus2, plus1 } = data.backgroundBonus;
      if (!plus2 || !plus1 || plus2 === plus1) return false;
    }
    if (data.edition === "2024") {
      const { mode, chosenFeat, manualName, manualDescription } = data.originFeat;
      if (mode === "catalog" && !chosenFeat) return false;
      if (mode === "manual" && (!manualName.trim() || !manualDescription.trim())) return false;
    }
    return true;
  }

  if (step === 4) {
    const values = ABILITIES.map((c) => data.baseScores[c]);
    if (data.scoreMethod === "array") {
      const validArray = (STANDARD_ARRAY as readonly number[]).slice().sort().join(",");
      return values.slice().sort().join(",") === validArray;
    }
    return values.every((v) => Number.isFinite(v) && v >= 1 && v <= 30);
  }

  return true;
}
