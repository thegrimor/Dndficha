"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

/** Selectable card used to choose race/class/background in the wizard. */
export function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-3 text-left text-sm transition-colors",
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:bg-secondary"
      )}
    >
      <span className="font-semibold">{title}</span>
      {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
      {children}
    </button>
  );
}
