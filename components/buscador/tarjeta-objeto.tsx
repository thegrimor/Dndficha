import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotonAnadirAFicha } from "@/components/buscador/boton-anadir-a-ficha";
import type { Open5eObjetoMagico } from "@/lib/open5e/types-recursos";

interface TarjetaObjetoProps {
  objeto: Open5eObjetoMagico;
}

export function TarjetaObjeto({ objeto }: TarjetaObjetoProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="normal-case tracking-normal text-base font-semibold">
          {objeto.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {objeto.type ?? "Objeto mágico"}
          {objeto.rarity && ` · ${objeto.rarity}`}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
        {objeto.requires_attunement && (
          <p>
            <span className="font-medium text-foreground">Sintonización:</span>{" "}
            {objeto.requires_attunement}
          </p>
        )}
        {objeto.desc && <p className="line-clamp-5">{objeto.desc}</p>}
        <div className="mt-auto pt-2">
          <BotonAnadirAFicha tipo="objeto" item={objeto} />
        </div>
      </CardContent>
    </Card>
  );
}
