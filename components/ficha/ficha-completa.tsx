import { BloqueAtaques } from "@/components/ficha/bloque-ataques";
import { BloqueCaracteristicas } from "@/components/ficha/bloque-caracteristicas";
import { BloqueCombate } from "@/components/ficha/bloque-combate";
import { BloqueEquipo } from "@/components/ficha/bloque-equipo";
import { BloqueHabilidades } from "@/components/ficha/bloque-habilidades";
import { BloqueHechizos } from "@/components/ficha/bloque-hechizos";
import { BloqueRasgosCompetencias } from "@/components/ficha/bloque-rasgos-competencias";
import { EncabezadoFicha } from "@/components/ficha/encabezado-ficha";
import type { Personaje } from "@/types/personaje";

export function FichaCompleta({ personaje }: { personaje: Personaje }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <EncabezadoFicha personaje={personaje} />
      <BloqueCaracteristicas sheet={personaje.sheet} nivel={personaje.level} />
      <BloqueCombate sheet={personaje.sheet} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BloqueHabilidades sheet={personaje.sheet} nivel={personaje.level} />
        <div className="flex flex-col gap-6">
          <BloqueAtaques sheet={personaje.sheet} />
          <BloqueEquipo sheet={personaje.sheet} />
          <BloqueHechizos sheet={personaje.sheet} />
          <BloqueRasgosCompetencias sheet={personaje.sheet} />
        </div>
      </div>
    </div>
  );
}
