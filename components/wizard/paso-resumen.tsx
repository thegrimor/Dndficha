"use client";

import { claseArmadura, iniciativa, modificadorConSigno, puntosGolpeIniciales } from "@/lib/dnd/calculos";
import { agregarCompetencias, calcularPuntuacionesFinales } from "@/lib/dnd/competencias";
import { CARACTERISTICAS, HABILIDADES, NOMBRES_CARACTERISTICAS } from "@/lib/dnd/constantes";
import { CLASES_SRD, RAZAS_SRD, TRASFONDOS_SRD } from "@/lib/dnd/datos-srd";
import { resolverDoteOrigen } from "@/lib/dnd/dotes";
import { EDICIONES_DND } from "@/lib/open5e/ediciones";
import type { DatosWizard } from "@/components/wizard/tipos";

export function PasoResumen({ datos }: { datos: DatosWizard }) {
  const raza = RAZAS_SRD.find((r) => r.id === datos.razaId);
  const clase = CLASES_SRD.find((c) => c.id === datos.claseId);
  const trasfondo = TRASFONDOS_SRD.find((t) => t.id === datos.trasfondoId);

  if (!raza || !clase || !trasfondo) {
    return <p className="text-sm text-muted-foreground">Completa los pasos anteriores para ver el resumen.</p>;
  }

  const puntuaciones = calcularPuntuacionesFinales({
    edicion: datos.edicion,
    raza,
    trasfondo,
    puntuacionesBase: datos.puntuacionesBase,
    eleccionesCaracteristicaRaza: datos.eleccionesCaracteristicaRaza,
    bonificadorTrasfondo: datos.bonificadorTrasfondo,
  });
  const { skills, savingThrows, languages, proficiencies } = agregarCompetencias({
    raza,
    clase,
    trasfondo,
    habilidadesClaseElegidas: datos.habilidadesClaseElegidas,
    idiomasTrasfondoElegidos: datos.idiomasTrasfondoElegidos,
  });
  const pgMax = Math.max(1, puntosGolpeIniciales(clase.dadoGolpe, puntuaciones.con));
  const doteOrigen = datos.edicion === "2024" ? resolverDoteOrigen(datos.doteOrigen) : null;

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="rounded-lg border border-border bg-card p-3">
        <h3 className="text-base font-semibold">{datos.nombre || "Sin nombre"}</h3>
        <p className="text-muted-foreground">
          {raza.nombre} · {clase.nombre} · {trasfondo.nombre} · Nivel 1 ·{" "}
          {EDICIONES_DND.find((e) => e.value === datos.edicion)?.label}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CARACTERISTICAS.map((car) => (
          <div key={car} className="rounded-lg border border-border bg-card p-2 text-center">
            <div className="text-xs text-muted-foreground">{NOMBRES_CARACTERISTICAS[car]}</div>
            <div className="text-lg font-semibold">{puntuaciones[car]}</div>
            <div className="text-xs text-muted-foreground">{modificadorConSigno(puntuaciones[car])}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Puntos de golpe</div>
          <div className="text-lg font-semibold">{pgMax}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Clase de armadura</div>
          <div className="text-lg font-semibold">{claseArmadura(puntuaciones.dex)}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-xs text-muted-foreground">Iniciativa</div>
          <div className="text-lg font-semibold">{modificadorConSigno(iniciativa(puntuaciones.dex))}</div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Salvaciones competentes</h4>
        <p className="text-muted-foreground">
          {Object.keys(savingThrows)
            .map((c) => NOMBRES_CARACTERISTICAS[c as keyof typeof NOMBRES_CARACTERISTICAS])
            .join(", ")}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Habilidades competentes</h4>
        <p className="text-muted-foreground">
          {Object.keys(skills)
            .map((id) => HABILIDADES.find((h) => h.id === id)?.nombre ?? id)
            .join(", ") || "Ninguna"}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Idiomas</h4>
        <p className="text-muted-foreground">{languages.join(", ")}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Competencias</h4>
        <p className="text-muted-foreground">
          Armadura: {proficiencies.armor.join(", ") || "Ninguna"}
          <br />
          Armas: {proficiencies.weapons.join(", ") || "Ninguna"}
          <br />
          Herramientas: {proficiencies.tools.join(", ") || "Ninguna"}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <h4 className="mb-1 font-medium">Rasgos</h4>
        <ul className="list-inside list-disc text-muted-foreground">
          {[...raza.rasgos, ...clase.rasgosNivel1, trasfondo.rasgo, ...(doteOrigen ? [doteOrigen] : [])].map(
            (rasgo) => (
              <li key={rasgo.nombre}>
                <span className="font-medium text-foreground">{rasgo.nombre}:</span> {rasgo.descripcion}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
