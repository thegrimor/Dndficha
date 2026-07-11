import { Suspense } from "react";

import { BuscadorObjetos } from "@/components/buscador/buscador-objetos";

export default function BuscadorObjetosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Buscador de objetos</h1>
        <p className="text-sm text-muted-foreground">
          Explora los objetos mágicos del SRD y añádelos al inventario de una de tus fichas.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando...</p>}>
        <BuscadorObjetos />
      </Suspense>
    </div>
  );
}
