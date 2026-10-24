import { Suspense } from "react";

import { SpellSearch } from "@/components/search/spell-search";

export default function SpellSearchPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Buscador de hechizos</h1>
        <p className="text-sm text-muted-foreground">
          Explora el catálogo SRD y añade hechizos directamente a una de tus fichas.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando...</p>}>
        <SpellSearch />
      </Suspense>
    </div>
  );
}
