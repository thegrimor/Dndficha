"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateCharacter } from "@/actions/characters";
import { EditControls } from "@/components/sheet/edit-controls";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CharacterSheet, CharacterDto } from "@dndficha/rules";

type CombatData = CharacterSheet["combat"];

export function CombatBlock({
  character,
  readOnly = false,
}: {
  character: CharacterDto;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const idBase = useId();
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const [combat, setCombat] = useState<CombatData>(() => character.sheet.combat);

  function cancel() {
    setCombat(character.sheet.combat);
    setEditing(false);
  }

  function save() {
    startSaving(async () => {
      const sheet: CharacterSheet = { ...character.sheet, combat };
      await updateCharacter(character.id, { sheet });
      router.refresh();
      setEditing(false);
    });
  }

  const current = editing ? combat : character.sheet.combat;

  if (!editing) {
    return (
      <div className="flex flex-col gap-2">
        {!readOnly && (
          <div className="flex justify-end">
            <EditControls
              editing={false}
              saving={false}
              onEdit={() => setEditing(true)}
              onCancel={cancel}
              onSave={save}
            />
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <StatCard label="CA" value={current.ac} />
          <StatCard
            label="Iniciativa"
            value={current.initiative >= 0 ? `+${current.initiative}` : current.initiative}
          />
          <StatCard label="Velocidad" value={`${current.speed} ft`} />
          <StatCard label="PG" value={`${current.hp.current}/${current.hp.max}`} />
          <StatCard label="Dados de golpe" value={current.hitDice} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <NumberField
          id={`${idBase}-ac`}
          label="CA"
          value={combat.ac}
          onChange={(v) => setCombat((c) => ({ ...c, ac: v }))}
        />
        <NumberField
          id={`${idBase}-init`}
          label="Iniciativa"
          value={combat.initiative}
          onChange={(v) => setCombat((c) => ({ ...c, initiative: v }))}
        />
        <NumberField
          id={`${idBase}-speed`}
          label="Velocidad (ft)"
          value={combat.speed}
          onChange={(v) => setCombat((c) => ({ ...c, speed: v }))}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idBase}-hitdice`} className="text-xs font-medium uppercase text-muted-foreground">
            Dados de golpe
          </label>
          <Input
            id={`${idBase}-hitdice`}
            value={combat.hitDice}
            onChange={(e) => setCombat((c) => ({ ...c, hitDice: e.target.value }))}
          />
        </div>
        <NumberField
          id={`${idBase}-hp-current`}
          label="PG actuales"
          value={combat.hp.current}
          onChange={(v) => setCombat((c) => ({ ...c, hp: { ...c.hp, current: v } }))}
        />
        <NumberField
          id={`${idBase}-hp-max`}
          label="PG máximos"
          value={combat.hp.max}
          onChange={(v) => setCombat((c) => ({ ...c, hp: { ...c.hp, max: v } }))}
        />
        <NumberField
          id={`${idBase}-hp-temp`}
          label="PG temporales"
          value={combat.hp.temp}
          onChange={(v) => setCombat((c) => ({ ...c, hp: { ...c.hp, temp: v } }))}
        />
      </div>
      <div>
        <EditControls
          editing
          saving={saving}
          onEdit={() => setEditing(true)}
          onCancel={cancel}
          onSave={save}
        />
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center gap-1 p-3">
        <span className="text-xs font-medium uppercase text-muted-foreground">{label}</span>
        <span className="text-xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}
