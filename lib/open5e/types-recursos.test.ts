import { describe, expect, it } from "vitest";

import {
  caracteristicasBonificadorTrasfondo,
  descripcionRasgoTrasfondo,
  habilidadesTrasfondo,
  herramientasTrasfondo,
  idiomasElegiblesTrasfondo,
  idsHabilidadDesdeTexto,
  nombreDoteTrasfondo,
  nombreRasgoTrasfondo,
  type Open5eTrasfondo,
} from "@/lib/open5e/types-recursos";

/** Trasfondo real de srd-2024 (Acolyte), tal como lo confirmó Open5e v2 en vivo. */
const ACOLITO_2024: Open5eTrasfondo = {
  key: "srd-2024_acolyte",
  name: "Acolyte",
  desc: "",
  benefits: [
    { name: "Ability Scores", desc: "Intelligence, Wisdom, Charisma", type: "ability_score" },
    {
      name: "Equipment",
      desc: "Choose A or B: (A) Calligrapher's Supplies, Book (prayers), Holy Symbol, Parchment (10 sheets), Robe, 8 GP; or (B) 50 GP",
      type: "equipment",
    },
    { name: "Feat", desc: "Magic Initiate (Cleric)", type: "feat" },
    { name: "Skill Proficiencies", desc: "Insight and Religion", type: "skill_proficiency" },
    { name: "Tool Proficiency", desc: "Calligrapher's Supplies", type: "tool_proficiency" },
  ],
};

describe("idsHabilidadDesdeTexto", () => {
  it("reconoce una lista separada por comas", () => {
    expect(idsHabilidadDesdeTexto("Insight, Religion")).toEqual(["insight", "religion"]);
  });

  it("reconoce 'and' y habilidades de dos palabras", () => {
    expect(idsHabilidadDesdeTexto("Sleight of Hand and Animal Handling")).toEqual([
      "sleight_of_hand",
      "animal_handling",
    ]);
  });

  it("ignora nombres que no reconoce en vez de romper", () => {
    expect(idsHabilidadDesdeTexto("Insight, Algo Inventado")).toEqual(["insight"]);
  });

  it("devuelve vacío si no hay texto", () => {
    expect(idsHabilidadDesdeTexto(undefined)).toEqual([]);
  });
});

describe("habilidadesTrasfondo / herramientas / idiomas (esquema real benefits[])", () => {
  it("lee las competencias de habilidad y herramienta de un trasfondo real (Acolyte 2024)", () => {
    expect(habilidadesTrasfondo(ACOLITO_2024)).toEqual(["insight", "religion"]);
    expect(herramientasTrasfondo(ACOLITO_2024)).toEqual(["Calligrapher's Supplies"]);
  });

  it("el SRD 2024 no otorga idiomas por trasfondo (sin beneficio de ese tipo)", () => {
    expect(idiomasElegiblesTrasfondo(ACOLITO_2024)).toBe(0);
  });

  it("reconoce un beneficio de idiomas si existiera (ej. SRD 2014)", () => {
    const bg: Open5eTrasfondo = {
      name: "Acolyte 2014",
      benefits: [{ name: "Languages", desc: "Two of your choice", type: "language" }],
    };
    expect(idiomasElegiblesTrasfondo(bg)).toBe(2);
  });

  it("no rompe si faltan benefits", () => {
    const bg: Open5eTrasfondo = { name: "Misterioso" };
    expect(habilidadesTrasfondo(bg)).toEqual([]);
    expect(herramientasTrasfondo(bg)).toEqual([]);
    expect(idiomasElegiblesTrasfondo(bg)).toBe(0);
  });
});

describe("nombreDoteTrasfondo", () => {
  it("lee la dote de origen del beneficio type: feat", () => {
    expect(nombreDoteTrasfondo(ACOLITO_2024)).toBe("Magic Initiate (Cleric)");
  });

  it("undefined si no hay beneficio de dote", () => {
    expect(nombreDoteTrasfondo({ name: "Misterioso" })).toBeUndefined();
  });
});

describe("caracteristicasBonificadorTrasfondo", () => {
  it("interpreta el trío real de un trasfondo 2024", () => {
    expect(caracteristicasBonificadorTrasfondo(ACOLITO_2024)).toEqual(["int", "wis", "cha"]);
  });

  it("undefined si no hay beneficio de ability_score o no se reconocen exactamente 3", () => {
    expect(caracteristicasBonificadorTrasfondo({ name: "Misterioso" })).toBeUndefined();
  });
});

describe("nombreRasgoTrasfondo / descripcionRasgoTrasfondo", () => {
  it("el SRD 2024 no tiene rasgo propio: nombre es el del trasfondo, descripción es el equipo", () => {
    expect(nombreRasgoTrasfondo(ACOLITO_2024)).toBe("Acolyte");
    expect(descripcionRasgoTrasfondo(ACOLITO_2024)).toContain("Calligrapher's Supplies");
  });
});
