import { BloqueAtaques } from "@/components/ficha/bloque-ataques";
import { BloqueCaracteristicas } from "@/components/ficha/bloque-caracteristicas";
import { BloqueCombate } from "@/components/ficha/bloque-combate";
import { BloqueEquipo } from "@/components/ficha/bloque-equipo";
import { BloqueHabilidades } from "@/components/ficha/bloque-habilidades";
import { BloqueHechizos } from "@/components/ficha/bloque-hechizos";
import { BloqueRasgosCompetencias } from "@/components/ficha/bloque-rasgos-competencias";
import { EncabezadoFicha } from "@/components/ficha/encabezado-ficha";
import { Tabs } from "@/components/ui/tabs";
import type { Personaje } from "@/types/personaje";

export function FichaCompleta({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <EncabezadoFicha personaje={personaje} soloLectura={soloLectura} />
      <BloqueCaracteristicas personaje={personaje} soloLectura={soloLectura} />
      <BloqueCombate personaje={personaje} soloLectura={soloLectura} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BloqueHabilidades personaje={personaje} soloLectura={soloLectura} />
        <Tabs
          items={[
            {
              value: "ataques",
              label: "Ataques",
              content: <BloqueAtaques personaje={personaje} soloLectura={soloLectura} />,
            },
            {
              value: "equipo",
              label: "Equipo",
              content: <BloqueEquipo personaje={personaje} soloLectura={soloLectura} />,
            },
            {
              value: "hechizos",
              label: "Hechizos",
              content: <BloqueHechizos personaje={personaje} soloLectura={soloLectura} />,
            },
            {
              value: "rasgos",
              label: "Rasgos",
              content: <BloqueRasgosCompetencias personaje={personaje} soloLectura={soloLectura} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
