import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotonAnadirAFicha } from "@/components/buscador/boton-anadir-a-ficha";
import {
  clasesHechizo,
  nombreNivelHechizo,
  type Open5eHechizo,
} from "@/lib/open5e/types-recursos";

const NOMBRES_ESCUELA: Record<string, string> = {
  abjuration: "Abjuración",
  conjuration: "Conjuración",
  divination: "Adivinación",
  enchantment: "Encantamiento",
  evocation: "Evocación",
  illusion: "Ilusión",
  necromancy: "Nigromancia",
  transmutation: "Transmutación",
};

function nombreEscuela(escuela?: string): string {
  if (!escuela) return "Escuela desconocida";
  return NOMBRES_ESCUELA[escuela.toLowerCase()] ?? escuela;
}

interface TarjetaHechizoProps {
  hechizo: Open5eHechizo;
}

export function TarjetaHechizo({ hechizo }: TarjetaHechizoProps) {
  const clases = clasesHechizo(hechizo);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="normal-case tracking-normal text-base font-semibold">
            {hechizo.name}
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          {nombreNivelHechizo(hechizo)} · {nombreEscuela(hechizo.school)}
          {(hechizo.concentration === true || hechizo.concentration === "yes") && " · Concentración"}
          {(hechizo.ritual === true || hechizo.ritual === "yes") && " · Ritual"}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
        {hechizo.range && (
          <p>
            <span className="font-medium text-foreground">Alcance:</span> {hechizo.range}
          </p>
        )}
        {hechizo.duration && (
          <p>
            <span className="font-medium text-foreground">Duración:</span> {hechizo.duration}
          </p>
        )}
        {hechizo.desc && <p className="line-clamp-4">{hechizo.desc}</p>}
        {clases.length > 0 && (
          <p className="text-xs">
            <span className="font-medium text-foreground">Clases:</span> {clases.join(", ")}
          </p>
        )}
        <div className="mt-auto pt-2">
          <BotonAnadirAFicha tipo="hechizo" item={hechizo} />
        </div>
      </CardContent>
    </Card>
  );
}
