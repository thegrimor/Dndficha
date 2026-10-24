"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateCharacter } from "@/actions/characters";
import { EditControls } from "@/components/sheet/edit-controls";
import { Input } from "@/components/ui/input";
import { DND_EDITIONS } from "@dndficha/rules";
import type { CharacterDto } from "@dndficha/rules";

interface HeaderData {
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
}

function dataFromCharacter(character: CharacterDto): HeaderData {
  return {
    name: character.name,
    race: character.race ?? "",
    class: character.class ?? "",
    level: character.level,
    background: character.background ?? "",
    alignment: character.alignment ?? "",
  };
}

export function SheetHeader({
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
  const [data, setData] = useState<HeaderData>(() => dataFromCharacter(character));

  function cancel() {
    setData(dataFromCharacter(character));
    setEditing(false);
  }

  function save() {
    startSaving(async () => {
      await updateCharacter(character.id, {
        name: data.name.trim() || "Sin nombre",
        race: data.race.trim() || null,
        class: data.class.trim() || null,
        level: Number.isFinite(data.level) ? data.level : 1,
        background: data.background.trim() || null,
        alignment: data.alignment.trim() || null,
      });
      router.refresh();
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold">{character.name}</h1>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {DND_EDITIONS.find((e) => e.value === character.sheet.edition)?.label ?? "D&D 5e (2014)"}
            </span>
          </div>
          <p className="text-muted-foreground">
            {character.race ?? "Raza sin definir"} · {character.class ?? "Clase sin definir"} ·
            Nivel {character.level}
            {character.background ? ` · ${character.background}` : ""}
            {character.alignment ? ` · ${character.alignment}` : ""}
          </p>
        </div>
        {!readOnly && (
          <EditControls
            editing={false}
            saving={false}
            onEdit={() => setEditing(true)}
            onCancel={cancel}
            onSave={save}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field id={`${idBase}-name`} label="Nombre">
          <Input
            id={`${idBase}-name`}
            value={data.name}
            onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
          />
        </Field>
        <Field id={`${idBase}-race`} label="Raza">
          <Input
            id={`${idBase}-race`}
            value={data.race}
            onChange={(e) => setData((d) => ({ ...d, race: e.target.value }))}
          />
        </Field>
        <Field id={`${idBase}-class`} label="Clase">
          <Input
            id={`${idBase}-class`}
            value={data.class}
            onChange={(e) => setData((d) => ({ ...d, class: e.target.value }))}
          />
        </Field>
        <Field id={`${idBase}-level`} label="Nivel">
          <Input
            id={`${idBase}-level`}
            type="number"
            min={1}
            max={20}
            value={data.level}
            onChange={(e) => setData((d) => ({ ...d, level: Number(e.target.value) }))}
          />
        </Field>
        <Field id={`${idBase}-background`} label="Trasfondo">
          <Input
            id={`${idBase}-background`}
            value={data.background}
            onChange={(e) => setData((d) => ({ ...d, background: e.target.value }))}
          />
        </Field>
        <Field id={`${idBase}-alignment`} label="Alineamiento">
          <Input
            id={`${idBase}-alignment`}
            value={data.alignment}
            onChange={(e) => setData((d) => ({ ...d, alignment: e.target.value }))}
          />
        </Field>
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

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
