import { notFound } from "next/navigation";

import { obtenerPersonaje } from "@/actions/personajes";
import { CompartirFicha } from "@/components/ficha/compartir-ficha";
import { FichaCompleta } from "@/components/ficha/ficha-completa";

export default async function FichaPersonajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personaje = await obtenerPersonaje(id);

  if (!personaje) notFound();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <CompartirFicha personaje={personaje} />
      <FichaCompleta personaje={personaje} />
    </div>
  );
}
