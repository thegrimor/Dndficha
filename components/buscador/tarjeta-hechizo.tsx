import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotonAnadirAFicha } from "@/components/buscador/boton-anadir-a-ficha";
import {
  clasesHechizo,
  nombreEscuela,
  nombreNivelHechizo,
  type Open5eHechizo,
} from "@/lib/open5e/types-recursos";

interface TarjetaHechizoProps {
  hechizo: Open5eHechizo;
  personajeIdForzado?: string;
}

export function TarjetaHechizo({ hechizo, personajeIdForzado }: TarjetaHechizoProps) {
  const clases = clasesHechizo(hechizo);
  const alcance = hechizo.range_text ?? hechizo.range;

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
        {alcance && (
          <p>
            <span className="font-medium text-foreground">Alcance:</span> {alcance}
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
          <BotonAnadirAFicha tipo="hechizo" item={hechizo} personajeIdForzado={personajeIdForzado} />
        </div>
      </CardContent>
    </Card>
  );
}
