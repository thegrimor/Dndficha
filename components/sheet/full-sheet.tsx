import { AttacksBlock } from "@/components/sheet/attacks-block";
import { AbilitiesBlock } from "@/components/sheet/abilities-block";
import { CombatBlock } from "@/components/sheet/combat-block";
import { EquipmentBlock } from "@/components/sheet/equipment-block";
import { SkillsBlock } from "@/components/sheet/skills-block";
import { SpellsBlock } from "@/components/sheet/spells-block";
import { FeaturesProficienciesBlock } from "@/components/sheet/features-proficiencies-block";
import { SheetHeader } from "@/components/sheet/sheet-header";
import { Tabs } from "@/components/ui/tabs";
import type { CharacterDto } from "@dndficha/rules";

export function FullSheet({
  character,
  readOnly = false,
}: {
  character: CharacterDto;
  readOnly?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <SheetHeader character={character} readOnly={readOnly} />
      <AbilitiesBlock character={character} readOnly={readOnly} />
      <CombatBlock character={character} readOnly={readOnly} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkillsBlock character={character} readOnly={readOnly} />
        <Tabs
          items={[
            {
              value: "attacks",
              label: "Ataques",
              content: <AttacksBlock character={character} readOnly={readOnly} />,
            },
            {
              value: "equipment",
              label: "Equipo",
              content: <EquipmentBlock character={character} readOnly={readOnly} />,
            },
            {
              value: "spells",
              label: "Hechizos",
              content: <SpellsBlock character={character} readOnly={readOnly} />,
            },
            {
              value: "features",
              label: "Rasgos",
              content: <FeaturesProficienciesBlock character={character} readOnly={readOnly} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
