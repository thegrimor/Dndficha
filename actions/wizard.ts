"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { agregarCompetencias, calcularPuntuacionesFinales } from "@/lib/dnd/competencias";
import { puntosGolpeIniciales, iniciativa, claseArmadura } from "@/lib/dnd/calculos";
import { CLASES_SRD, RAZAS_SRD } from "@/lib/dnd/datos-srd";
import { createClient } from "@/lib/supabase/server";
import { resolverDoteOrigen, type DatosWizard } from "@/components/wizard/tipos";
import { fichaVacia } from "@/types/personaje";

async function usuarioActualOFalla() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

export async function crearPersonajeDesdeWizard(datos: DatosWizard) {
  const { supabase, user } = await usuarioActualOFalla();

  const raza = RAZAS_SRD.find((r) => r.id === datos.razaId);
  const clase = CLASES_SRD.find((c) => c.id === datos.claseId);
  const trasfondo = datos.trasfondoDatos;

  if (!raza || !clase || !trasfondo) {
    throw new Error("Faltan datos del wizard: raza, clase o trasfondo sin seleccionar.");
  }

  const abilityScores = calcularPuntuacionesFinales({
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

  const ficha = fichaVacia();
  ficha.edicion = datos.edicion;
  ficha.abilityScores = abilityScores;
  ficha.savingThrows = savingThrows;
  ficha.skills = skills;
  ficha.languages = languages;
  ficha.proficiencies = proficiencies;
  const doteOrigen = datos.edicion === "2024" ? resolverDoteOrigen(datos.doteOrigen) : null;
  ficha.features = [...raza.rasgos, ...clase.rasgosNivel1, trasfondo.rasgo, ...(doteOrigen ? [doteOrigen] : [])];

  const pgMax = Math.max(1, puntosGolpeIniciales(clase.dadoGolpe, abilityScores.con));
  ficha.combat = {
    ac: claseArmadura(abilityScores.dex),
    initiative: iniciativa(abilityScores.dex),
    speed: raza.velocidad,
    hp: { current: pgMax, max: pgMax, temp: 0 },
    hitDice: `1d${clase.dadoGolpe}`,
  };

  const { data, error } = await supabase
    .from("characters")
    .insert({
      owner_id: user.id,
      name: datos.nombre || "Nuevo personaje",
      race: raza.nombre,
      class: clase.nombre,
      level: 1,
      background: trasfondo.nombre,
      sheet: ficha,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/personajes");
  redirect(`/personajes/${data.id}`);
}
