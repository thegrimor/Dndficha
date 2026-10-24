import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddToSheetButton } from "@/components/search/add-to-sheet-button";
import {
  spellClasses,
  schoolName,
  spellLevelName,
  type Open5eSpell,
} from "@dndficha/rules";

interface SpellCardProps {
  spell: Open5eSpell;
  forcedCharacterId?: string;
}

export function SpellCard({ spell, forcedCharacterId }: SpellCardProps) {
  const classes = spellClasses(spell);
  const scope = spell.range_text ?? spell.range;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="normal-case tracking-normal text-base font-semibold">
            {spell.name}
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          {spellLevelName(spell)} · {schoolName(spell.school)}
          {(spell.concentration === true || spell.concentration === "yes") && " · Concentración"}
          {(spell.ritual === true || spell.ritual === "yes") && " · Ritual"}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
        {scope && (
          <p>
            <span className="font-medium text-foreground">Alcance:</span> {scope}
          </p>
        )}
        {spell.duration && (
          <p>
            <span className="font-medium text-foreground">Duración:</span> {spell.duration}
          </p>
        )}
        {spell.desc && <p className="line-clamp-4">{spell.desc}</p>}
        {classes.length > 0 && (
          <p className="text-xs">
            <span className="font-medium text-foreground">Clases:</span> {classes.join(", ")}
          </p>
        )}
        <div className="mt-auto pt-2">
          <AddToSheetButton type="spell" item={spell} forcedCharacterId={forcedCharacterId} />
        </div>
      </CardContent>
    </Card>
  );
}
