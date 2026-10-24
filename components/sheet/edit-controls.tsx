"use client";

import { Button } from "@/components/ui/button";

/**
 * Row of "Edit" / "Cancel" + "Save" buttons reused by all the editable
 * blocks of the sheet. Each block keeps its own editing state; this
 * component only renders the buttons and delegates the actions.
 */
export function EditControls({
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
}: {
  editing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (!editing) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        Editar
      </Button>
    );
  }

  return (
    <div className="flex shrink-0 gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        disabled={saving}
      >
        Cancelar
      </Button>
      <Button type="button" size="sm" onClick={onSave} disabled={saving}>
        {saving ? "Guardando…" : "Guardar"}
      </Button>
    </div>
  );
}
