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

type Item = CharacterSheet["inventory"][number];

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function EquipmentBlock({
  character,
  readOnly = false,
}: {
  character: CharacterDto;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const [inventory, setInventory] = useState<Item[]>(() => character.sheet.inventory);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");

  function cancel() {
    setInventory(character.sheet.inventory);
    setNewName("");
    setNewType("");
    setEditing(false);
  }

  function save() {
    startSaving(async () => {
      const sheet: CharacterSheet = { ...character.sheet, inventory: inventory };
      await updateCharacter(character.id, { sheet });
      router.refresh();
      setEditing(false);
    });
  }

  function deleteItem(i: number) {
    setInventory((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addItem() {
    if (!newName.trim()) return;
    setInventory((prev) => [
      ...prev,
      { slug: generateId(), name: newName.trim(), type: newType.trim() || "Objeto", source: "manual" },
    ]);
    setNewName("");
    setNewType("");
  }

  const items = editing ? inventory : character.sheet.inventory;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle>Equipo</CardTitle>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Link
              href={`/buscador/objetos?personaje=${character.id}`}
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
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Inventario vacío. Añade objetos desde el buscador SRD.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {items.map((item, i) => (
              <li key={item.slug || i} className="flex items-center justify-between border-b border-border py-1">
                <span>{item.name}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  {item.type}
                  {item.source === "manual" && (
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-xs">Manual</span>
                  )}
                  {editing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(i)}
                      aria-label={`Quitar ${item.name}`}
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
              <label htmlFor="item-new-name" className="text-xs font-medium uppercase text-muted-foreground">
                Nombre
              </label>
              <Input
                id="item-new-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Cuerda de 15m"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="item-new-type" className="text-xs font-medium uppercase text-muted-foreground">
                Tipo
              </label>
              <Input
                id="item-new-type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Ej. Aventura"
              />
            </div>
            <Button type="button" size="sm" onClick={addItem}>
              Añadir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
