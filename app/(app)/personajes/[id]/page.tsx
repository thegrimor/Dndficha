import { notFound } from "next/navigation";

import { obtenerPersonaje } from "@/actions/personajes";
import { FichaCompleta } from "@/components/ficha/ficha-completa";

export default async function FichaPersonajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personaje = await obtenerPersonaje(id);

  if (!personaje) notFound();

  return <FichaCompleta personaje={personaje} />;
}
