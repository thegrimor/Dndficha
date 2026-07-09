"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { actualizarPersonaje } from "@/actions/personajes";
import { ControlesEdicion } from "@/components/ficha/controles-edicion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { FichaPersonaje, Personaje } from "@/types/personaje";

type DatosCombate = FichaPersonaje["combat"];

export function BloqueCombate({
  personaje,
  soloLectura = false,
}: {
  personaje: Personaje;
  soloLectura?: boolean;
}) {
  const router = useRouter();
  const idBase = useId();
  const [editando, setEditando] = useState(false);
  const [guardando, iniciarGuardado] = useTransition();
  const [combat, setCombat] = useState<DatosCombate>(() => personaje.sheet.combat);

  function cancelar() {
    setCombat(personaje.sheet.combat);
    setEditando(false);
  }

  function guardar() {
    iniciarGuardado(async () => {
      const sheet: FichaPersonaje = { ...personaje.sheet, combat };
      await actualizarPersonaje(personaje.id, { sheet });
      router.refresh();
      setEditando(false);
    });
  }

  const actual = editando ? combat : personaje.sheet.combat;

  if (!editando) {
    return (
      <div className="flex flex-col gap-2">
        {!soloLectura && (
          <div className="flex justify-end">
            <ControlesEdicion
              editando={false}
              guardando={false}
              onEditar={() => setEditando(true)}
              onCancelar={cancelar}
              onGuardar={guardar}
            />
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <StatCard etiqueta="CA" valor={actual.ac} />
          <StatCard
            etiqueta="Iniciativa"
            valor={actual.initiative >= 0 ? `+${actual.initiative}` : actual.initiative}
          />
          <StatCard etiqueta="Velocidad" valor={`${actual.speed} ft`} />
          <StatCard etiqueta="PG" valor={`${actual.hp.current}/${actual.hp.max}`} />
          <StatCard etiqueta="Dados de golpe" valor={actual.hitDice} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <CampoNumero
          id={`${idBase}-ac`}
          etiqueta="CA"
          valor={combat.ac}
          onChange={(v) => setCombat((c) => ({ ...c, ac: v }))}
        />
        <CampoNumero
          id={`${idBase}-init`}
          etiqueta="Iniciativa"
          valor={combat.initiative}
          onChange={(v) => setCombat((c) => ({ ...c, initiative: v }))}
        />
        <CampoNumero
          id={`${idBase}-speed`}
          etiqueta="Velocidad (ft)"
          valor={combat.speed}
          onChange={(v) => setCombat((c) => ({ ...c, speed: v }))}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={`${idBase}-hitdice`} className="text-xs font-medium uppercase text-muted-foreground">
            Dados de golpe
          </label>
          <Input
            id={`${idBase}-hitdice`}
            value={combat.hitDice}
            onChange={(e) => setCombat((c) => ({ ...c, hitDice: e.target.value }))}
          />
        </div>
        <CampoNumero
          id={`${idBase}-hp-current`}
          etiqueta="PG actuales"
          valor={combat.hp.current}
          onChange={(v) => setCombat((c) => ({ ...c, hp: { ...c.hp, current: v } }))}
        />
        <CampoNumero
          id={`${idBase}-hp-max`}
          etiqueta="PG máximos"
          valor={combat.hp.max}
          onChange={(v) => setCombat((c) => ({ ...c, hp: { ...c.hp, max: v } }))}
        />
        <CampoNumero
          id={`${idBase}-hp-temp`}
          etiqueta="PG temporales"
          valor={combat.hp.temp}
          onChange={(v) => setCombat((c) => ({ ...c, hp: { ...c.hp, temp: v } }))}
        />
      </div>
      <div>
        <ControlesEdicion
          editando
          guardando={guardando}
          onEditar={() => setEditando(true)}
          onCancelar={cancelar}
          onGuardar={guardar}
        />
      </div>
    </div>
  );
}

function CampoNumero({
  id,
  etiqueta,
  valor,
  onChange,
}: {
  id: string;
  etiqueta: string;
  valor: number;
  onChange: (valor: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium uppercase text-muted-foreground">
        {etiqueta}
      </label>
      <Input
        id={id}
        type="number"
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function StatCard({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <Card className="text-center">
      <CardContent className="flex flex-col items-center gap-1 p-3">
        <span className="text-xs font-medium uppercase text-muted-foreground">{etiqueta}</span>
        <span className="text-xl font-bold">{valor}</span>
      </CardContent>
    </Card>
  );
}
