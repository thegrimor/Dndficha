"use client";

import { Button } from "@/components/ui/button";

/**
 * Fila de botones "Editar" / "Cancelar" + "Guardar" reutilizada por todos los
 * bloques editables de la ficha. Cada bloque mantiene su propio estado de
 * edición; este componente solo pinta los botones y delega las acciones.
 */
export function ControlesEdicion({
  editando,
  guardando,
  onEditar,
  onCancelar,
  onGuardar,
}: {
  editando: boolean;
  guardando: boolean;
  onEditar: () => void;
  onCancelar: () => void;
  onGuardar: () => void;
}) {
  if (!editando) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={onEditar}>
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
        onClick={onCancelar}
        disabled={guardando}
      >
        Cancelar
      </Button>
      <Button type="button" size="sm" onClick={onGuardar} disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar"}
      </Button>
    </div>
  );
}
