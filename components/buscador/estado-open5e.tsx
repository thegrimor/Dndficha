import { Button } from "@/components/ui/button";

/** Mensaje amigable + botón de reintento para cuando /api/open5e/* responde 503. */
export function ErrorCatalogoOpen5e({ onReintentar }: { onReintentar: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
      <p className="text-sm text-muted-foreground">
        No se pudo cargar el catálogo del SRD ahora mismo. Puede que Open5e no esté disponible.
      </p>
      <Button variant="outline" size="sm" onClick={onReintentar}>
        Reintentar
      </Button>
    </div>
  );
}

export function CargandoCatalogoOpen5e() {
  return (
    <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
      Cargando...
    </div>
  );
}

export function SinResultadosOpen5e() {
  return (
    <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
      No se encontraron resultados con esos filtros.
    </div>
  );
}
