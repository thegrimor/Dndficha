import { BuscadorMonstruos } from "@/components/buscador/buscador-monstruos";

export default function BuscadorMonstruosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Buscador de monstruos</h1>
        <p className="text-sm text-muted-foreground">
          Consulta el bestiario SRD (solo lectura, sin añadir a fichas todavía).
        </p>
      </div>
      <BuscadorMonstruos />
    </div>
  );
}
