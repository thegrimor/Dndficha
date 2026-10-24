"use client";

import { DND_EDITIONS, type DndEdition } from "@dndficha/rules";
import { OptionCard } from "@/components/wizard/option-card";
import type { WizardData } from "@/components/wizard/types";

const DESCRIPTIONS: Record<DndEdition, string> = {
  "2014": "Reglas clásicas (Manual del Jugador 2014). Las razas dan el bonificador de característica.",
  "2024": "Reglas revisadas ('One D&D'). El trasfondo da el bonificador de característica; las razas se llaman especies.",
};

export function EditionStep({
  data,
  update,
}: {
  data: WizardData;
  update: (changes: Partial<WizardData>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Elige con qué edición de reglas juegas. El buscador de hechizos y objetos de esta
        ficha usará automáticamente esta edición, sin tener que volver a elegirla cada vez.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DND_EDITIONS.map((option) => (
          <OptionCard
            key={option.value}
            selected={option.value === data.edition}
            onClick={() => update({ edition: option.value })}
            title={option.label}
          >
            <span className="text-xs text-muted-foreground">{DESCRIPTIONS[option.value]}</span>
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
