import { BuscadorHechizos } from "@/components/buscador/buscador-hechizos";

export default function BuscadorHechizosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Buscador de hechizos</h1>
        <p className="text-sm text-muted-foreground">
          Explora el catálogo SRD y añade hechizos directamente a una de tus fichas.
        </p>
      </div>
      <BuscadorHechizos />
    </div>
  );
}
