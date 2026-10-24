"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { updateCharacter } from "@/actions/characters";
import { EditControls } from "@/components/sheet/edit-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CharacterSheet, CharacterDto } from "@dndficha/rules";

type Spell = CharacterSheet["spells"]["known"][number];

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SpellsBlock({
  character,
  readOnly = false,
}: {
  character: CharacterDto;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const [known, setKnown] = useState<Spell[]>(() => character.sheet.spells.known);
  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState(0);

  function cancel() {
    setKnown(character.sheet.spells.known);
    setNewName("");
    setNewLevel(0);
    setEditing(false);
  }

  function save() {
    startSaving(async () => {
      const sheet: CharacterSheet = {
        ...character.sheet,
        spells: { ...character.sheet.spells, known: known },
      };
      await updateCharacter(character.id, { sheet });
      router.refresh();
      setEditing(false);
    });
  }

  function togglePrepared(i: number) {
    setKnown((prev) =>
      prev.map((h, idx) => (idx === i ? { ...h, prepared: !h.prepared } : h))
    );
  }

  function deleteSpell(i: number) {
    setKnown((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addSpell() {
    if (!newName.trim()) return;
    setKnown((prev) => [
      ...prev,
      {
        slug: generateId(),
        name: newName.trim(),
        level: newLevel,
        source: "manual",
        prepared: false,
      },
    ]);
    setNewName("");
    setNewLevel(0);
  }

  const list = editing ? known : character.sheet.spells.known;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>Hechizos</CardTitle>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Link
              href={`/buscador/hechizos?personaje=${character.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Buscar en el SRD
            </Link>
            <EditControls
              editing={editing}
              saving={saving}
              onEdit={() => setEditing(true)}
              onCancel={cancel}
              onSave={save}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin hechizos conocidos todavía. Búscalos en el catálogo SRD.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {list.map((spell, i) => (
              <li key={spell.slug || i} className="flex items-center justify-between border-b border-border py-1">
                {editing ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(spell.prepared)}
                      onChange={() => togglePrepared(i)}
                    />
                    {spell.name}
                  </label>
                ) : (
                  <span>
                    {spell.prepared ? "●" : "○"} {spell.name}
                  </span>
                )}
                <span className="flex items-center gap-2 text-muted-foreground">
                  Nivel {spell.level}
                  {editing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSpell(i)}
                      aria-label={`Quitar ${spell.name}`}
                    >
                      Quitar
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        {editing && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="spell-new-name" className="text-xs font-medium uppercase text-muted-foreground">
                Nombre
              </label>
              <Input
                id="spell-new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Bola de fuego"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="spell-new-level" className="text-xs font-medium uppercase text-muted-foreground">
                Nivel
              </label>
              <Input
                id="spell-new-level"
                type="number"
                min={0}
                max={9}
                className="w-20"
                value={newLevel}
                onChange={(e) => setNewLevel(Number(e.target.value))}
              />
            </div>
            <Button type="button" size="sm" onClick={addSpell}>
              Añadir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
