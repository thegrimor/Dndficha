"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";

import { crearPersonajeDesdeWizard } from "@/actions/wizard";
import { CARACTERISTICAS } from "@/lib/dnd/constantes";
import { CLASES_SRD, RAZAS_SRD, TRASFONDOS_SRD } from "@/lib/dnd/datos-srd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ARRAY_ESTANDAR, datosWizardIniciales } from "@/components/wizard/tipos";
import { PasoRaza } from "@/components/wizard/paso-raza";
import { PasoClase } from "@/components/wizard/paso-clase";
import { PasoTrasfondo } from "@/components/wizard/paso-trasfondo";
import { PasoPuntuaciones } from "@/components/wizard/paso-puntuaciones";
import { PasoResumen } from "@/components/wizard/paso-resumen";

const PASOS = ["Raza", "Clase", "Trasfondo", "Puntuaciones", "Resumen"] as const;

export function WizardContainer() {
  const [paso, setPaso] = useState(0);
  const [datos, setDatos] = useState(datosWizardIniciales());
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function actualizar(cambios: Partial<typeof datos>) {
    setDatos((prev) => ({ ...prev, ...cambios }));
  }

  const puedeAvanzar = calcularPuedeAvanzar(paso, datos);

  function confirmar() {
    setError(null);
    iniciarTransicion(async () => {
      try {
        await crearPersonajeDesdeWizard(datos);
      } catch (err) {
        unstable_rethrow(err);
        setError(err instanceof Error ? err.message : "No se pudo crear el personaje.");
      }
    });
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Nuevo personaje</CardTitle>
        <div className="flex flex-wrap gap-2 pt-1">
          {PASOS.map((nombrePaso, indice) => (
            <span
              key={nombrePaso}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                indice === paso
                  ? "bg-primary text-primary-foreground"
                  : indice < paso
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground"
              )}
            >
              {indice + 1}. {nombrePaso}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className="text-sm font-medium">
            Nombre del personaje
          </label>
          <Input
            id="nombre"
            value={datos.nombre}
            onChange={(e) => actualizar({ nombre: e.target.value })}
            placeholder="Ej. Elara Lunanoche"
            autoFocus
          />
        </div>

        {paso === 0 && <PasoRaza datos={datos} actualizar={actualizar} />}
        {paso === 1 && <PasoClase datos={datos} actualizar={actualizar} />}
        {paso === 2 && <PasoTrasfondo datos={datos} actualizar={actualizar} />}
        {paso === 3 && <PasoPuntuaciones datos={datos} actualizar={actualizar} />}
        {paso === 4 && <PasoResumen datos={datos} />}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={paso === 0}
            onClick={() => setPaso((p) => Math.max(0, p - 1))}
          >
            Anterior
          </Button>
          {paso < PASOS.length - 1 ? (
            <Button
              type="button"
              disabled={!puedeAvanzar}
              onClick={() => setPaso((p) => Math.min(PASOS.length - 1, p + 1))}
            >
              Siguiente
            </Button>
          ) : (
            <Button type="button" disabled={pendiente} onClick={confirmar}>
              {pendiente ? "Creando..." : "Confirmar y crear"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function calcularPuedeAvanzar(paso: number, datos: ReturnType<typeof datosWizardIniciales>): boolean {
  if (paso === 0) {
    if (!datos.nombre.trim() || !datos.razaId) return false;
    const raza = RAZAS_SRD.find((r) => r.id === datos.razaId);
    if (!raza) return false;
    if (raza.eleccionLibre && datos.eleccionesCaracteristicaRaza.length !== raza.eleccionLibre.cantidad) {
      return false;
    }
    return true;
  }

  if (paso === 1) {
    const clase = CLASES_SRD.find((c) => c.id === datos.claseId);
    if (!clase) return false;
    return datos.habilidadesClaseElegidas.length === clase.numHabilidadesElegibles;
  }

  if (paso === 2) {
    const trasfondo = TRASFONDOS_SRD.find((t) => t.id === datos.trasfondoId);
    if (!trasfondo) return false;
    return datos.idiomasTrasfondoElegidos.length === trasfondo.numIdiomasElegibles;
  }

  if (paso === 3) {
    const valores = CARACTERISTICAS.map((c) => datos.puntuacionesBase[c]);
    if (datos.metodoPuntuaciones === "array") {
      const arrayValido = (ARRAY_ESTANDAR as readonly number[]).slice().sort().join(",");
      return valores.slice().sort().join(",") === arrayValido;
    }
    return valores.every((v) => Number.isFinite(v) && v >= 1 && v <= 30);
  }

  return true;
}
