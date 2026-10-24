import { Button } from "@/components/ui/button";

/** Friendly message + retry button for when /api/open5e/* responds 503. */
export function Open5eCatalogError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
      <p className="text-sm text-muted-foreground">
        No se pudo cargar el catálogo del SRD ahora mismo. Puede que Open5e no esté disponible.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

export function Open5eCatalogLoading() {
  return (
    <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
      Cargando...
    </div>
  );
}

export function Open5eNoResults() {
  return (
    <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
      No se encontraron resultados con esos filtros.
    </div>
  );
}
