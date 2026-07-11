"use client";

import { useState } from "react";

import { agregarHechizoAFicha, agregarObjetoAFicha } from "@/actions/buscador";
import { listarPersonajes } from "@/actions/personajes";
import { Button } from "@/components/ui/button";
import type { Open5eHechizo, Open5eObjetoMagico } from "@/lib/open5e/types-recursos";
import type { Personaje } from "@/types/personaje";

type Estado =
  | { fase: "inicial" }
  | { fase: "cargando-fichas" }
  | { fase: "elegir-ficha"; fichas: Personaje[] }
  | { fase: "guardando" }
  | { fase: "exito" }
  | { fase: "error"; mensaje: string };

interface BotonAnadirAFichaProps {
  tipo: "hechizo" | "objeto";
  item: Open5eHechizo | Open5eObjetoMagico;
  /** Si se conoce de antemano a qué ficha añadir (ej. se entró desde esa
   * ficha), se guarda directo sin preguntar ni listar todas las fichas. */
  personajeIdForzado?: string;
}

/**
 * Botón "Añadir a ficha" para tarjetas del buscador SRD. Si ya se sabe a
 * qué personaje añadir (personajeIdForzado), guarda directo. Si no, y el
 * usuario tiene más de un personaje, le deja elegir con un <select>; si
 * tiene solo uno, añade directamente; si no tiene ninguno, avisa.
 */
export function BotonAnadirAFicha({ tipo, item, personajeIdForzado }: BotonAnadirAFichaProps) {
  const [estado, setEstado] = useState<Estado>({ fase: "inicial" });
  const [fichaSeleccionada, setFichaSeleccionada] = useState<string>("");

  async function manejarClickInicial() {
    if (personajeIdForzado) {
      await guardar(personajeIdForzado);
      return;
    }

    setEstado({ fase: "cargando-fichas" });
    try {
      const fichas = await listarPersonajes();

      if (fichas.length === 0) {
        setEstado({
          fase: "error",
          mensaje: "No tienes fichas todavía. Crea un personaje primero.",
        });
        return;
      }

      if (fichas.length === 1) {
        await guardar(fichas[0].id);
        return;
      }

      setFichaSeleccionada(fichas[0].id);
      setEstado({ fase: "elegir-ficha", fichas });
    } catch {
      setEstado({ fase: "error", mensaje: "No se pudieron cargar tus fichas." });
    }
  }

  async function guardar(personajeId: string) {
    setEstado({ fase: "guardando" });

    const resultado =
      tipo === "hechizo"
        ? await agregarHechizoAFicha(personajeId, item as Open5eHechizo)
        : await agregarObjetoAFicha(personajeId, item as Open5eObjetoMagico);

    if (resultado.ok) {
      setEstado({ fase: "exito" });
      setTimeout(() => setEstado({ fase: "inicial" }), 2000);
    } else {
      setEstado({ fase: "error", mensaje: resultado.error ?? "No se pudo añadir." });
    }
  }

  if (estado.fase === "elegir-ficha") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={fichaSeleccionada}
          onChange={(evento) => setFichaSeleccionada(evento.target.value)}
          className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {estado.fichas.map((ficha) => (
            <option key={ficha.id} value={ficha.id}>
              {ficha.name}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={() => guardar(fichaSeleccionada)}>
          Confirmar
        </Button>
      </div>
    );
  }

  const cargando = estado.fase === "cargando-fichas" || estado.fase === "guardando";

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        size="sm"
        variant={estado.fase === "exito" ? "secondary" : "default"}
        disabled={cargando}
        onClick={manejarClickInicial}
      >
        {estado.fase === "cargando-fichas" && "Cargando fichas..."}
        {estado.fase === "guardando" && "Añadiendo..."}
        {estado.fase === "exito" && "Añadido ✓"}
        {(estado.fase === "inicial" || estado.fase === "error") && "Añadir a ficha"}
      </Button>
      {estado.fase === "error" && (
        <p className="text-xs text-destructive">{estado.mensaje}</p>
      )}
    </div>
  );
}
