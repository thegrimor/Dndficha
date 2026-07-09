"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Tabs mínimas hechas a mano (sin Radix). Pensadas para apilar bloques de la
 * ficha en móvil sin scroll infinito, evitando duplicar contenido en el DOM.
 */
export function Tabs({
  items,
  defaultValue,
  className,
}: {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}) {
  const [activo, setActivo] = React.useState(defaultValue ?? items[0]?.value);
  const idBase = React.useId();

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Secciones de la ficha"
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {items.map((item) => {
          const seleccionado = activo === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`${idBase}-tab-${item.value}`}
              aria-selected={seleccionado}
              aria-controls={`${idBase}-panel-${item.value}`}
              tabIndex={seleccionado ? 0 : -1}
              onClick={() => setActivo(item.value)}
              className={cn(
                "rounded-t-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                seleccionado
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${idBase}-panel-${item.value}`}
          aria-labelledby={`${idBase}-tab-${item.value}`}
          hidden={activo !== item.value}
          className="pt-4"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
