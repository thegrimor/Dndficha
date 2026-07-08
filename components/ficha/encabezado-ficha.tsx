import type { Personaje } from "@/types/personaje";

export function EncabezadoFicha({ personaje }: { personaje: Personaje }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-4">
      <h1 className="text-3xl font-bold">{personaje.name}</h1>
      <p className="text-muted-foreground">
        {personaje.race ?? "Raza sin definir"} · {personaje.class ?? "Clase sin definir"} ·
        Nivel {personaje.level}
        {personaje.background ? ` · ${personaje.background}` : ""}
        {personaje.alignment ? ` · ${personaje.alignment}` : ""}
      </p>
    </div>
  );
}
