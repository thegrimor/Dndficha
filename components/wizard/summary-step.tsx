"use client";

import { armorClass, initiative, signedModifier, initialHitPoints } from "@dndficha/rules";
import { aggregateProficiencies, computeFinalScores } from "@dndficha/rules";
import { ABILITIES, SKILLS, ABILITY_NAMES } from "@dndficha/rules";
import { CLASSES_SRD, RACES_SRD } from "@dndficha/rules";
import { DND_EDITIONS } from "@dndficha/rules";
import { resolveOriginFeat, type WizardData } from "@/components/wizard/types";

export function SummaryStep({ data }: { data: WizardData }) {
  const race = RACES_SRD.find((r) => r.id === data.raceId);
  const characterClass = CLASSES_SRD.find((c) => c.id === data.classId);
  const background = data.backgroundData;

  if (!race || !characterClass || !background) {
    return <p className="text-sm text-muted-foreground">Completa los pasos anteriores para ver el resumen.</p>;
  }

  const scores = computeFinalScores({
    edition: data.edition,
    race,
    background,
    baseScores: data.baseScores,
    raceAbilityChoices: data.raceAbilityChoices,
    backgroundBonus: data.backgroundBonus,
  });
  const { skills, savingThrows, languages, proficiencies } = aggregateProficiencies({
    race,
    characterClass,
    background,
    chosenClassSkills: data.chosenClassSkills,
    chosenBackgroundLanguages: data.chosenBackgroundLanguages,
  });
  const maxHp = Math.max(1, initialHitPoints(characterClass.hitDie, scores.con));
  const originFeat = data.edition === "2024" ? resolveOriginFeat(data.originFeat) : null;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="rounded-lg border border-border bg-card p-3">
        <h3 className="text-base font-semibold">{data.name || "Sin nombre"}</h3>
        <p className="text-muted-foreground">
          {race.name} · {characterClass.name} · {background.name} · Nivel 1 ·{" "}
          {DND_EDITIONS.find((e) => e.value === data.edition)?.label}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ABILITIES.map((ability) => (
          <div key={ability} className="rounded-lg border border-border bg-card p-2 text-center">
            <div className="text-xs text-muted-foreground">{ABILITY_NAMES[ability]}</div>
            <div className="text-lg font-semibold">{scores[ability]}</div>
            <div className="text-xs text-muted-foreground">{signedModifier(scores[ability])}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Puntos de golpe</div>
          <div className="text-lg font-semibold">{maxHp}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Clase de armadura</div>
          <div className="text-lg font-semibold">{armorClass(scores.dex)}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Iniciativa</div>
          <div className="text-lg font-semibold">{signedModifier(initiative(scores.dex))}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Salvaciones competentes</h4>
        <p className="text-muted-foreground">
          {Object.keys(savingThrows)
            .map((c) => ABILITY_NAMES[c as keyof typeof ABILITY_NAMES])
            .join(", ")}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Habilidades competentes</h4>
        <p className="text-muted-foreground">
          {Object.keys(skills)
            .map((id) => SKILLS.find((h) => h.id === id)?.name ?? id)
            .join(", ") || "Ninguna"}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Idiomas</h4>
        <p className="text-muted-foreground">{languages.join(", ")}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Competencias</h4>
        <p className="text-muted-foreground">
          Armadura: {proficiencies.armor.join(", ") || "Ninguna"}
          <br />
          Armas: {proficiencies.weapons.join(", ") || "Ninguna"}
          <br />
          Herramientas: {proficiencies.tools.join(", ") || "Ninguna"}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Rasgos</h4>
        <ul className="list-inside list-disc text-muted-foreground">
          {[...race.features, ...characterClass.level1Features, background.feature, ...(originFeat ? [originFeat] : [])].map(
            (feature) => (
              <li key={feature.name}>
                <span className="font-medium text-foreground">{feature.name}:</span> {feature.description}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
