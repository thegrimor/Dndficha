import { describe, expect, it } from "vitest";

import {
  descripcionDote,
  habilidadesTrasfondo,
  herramientasTrasfondo,
  idiomasElegiblesTrasfondo,
  idsHabilidadDesdeTexto,
  nombreRasgoTrasfondo,
  type Open5eTrasfondo,
} from "@/lib/open5e/types-recursos";

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

describe("habilidadesTrasfondo / herramientas / idiomas", () => {
  it("lee el campo con guion (v1)", () => {
    const bg: Open5eTrasfondo = {
      name: "Acolyte",
      "skill-proficiencies": "Insight, Religion",
      "tool-proficiencies": "None",
      languages: "Two of your choice",
    };
    expect(habilidadesTrasfondo(bg)).toEqual(["insight", "religion"]);
    expect(herramientasTrasfondo(bg)).toEqual([]);
    expect(idiomasElegiblesTrasfondo(bg)).toBe(2);
  });

  it("lee el campo con guion bajo (posible v2) igual de bien", () => {
    const bg: Open5eTrasfondo = {
      name: "Criminal",
      skill_proficiencies: "Deception, Stealth",
      tool_proficiencies: "Thieves' tools, one gaming set",
    };
    expect(habilidadesTrasfondo(bg)).toEqual(["deception", "stealth"]);
    expect(herramientasTrasfondo(bg)).toEqual(["Thieves' tools", "one gaming set"]);
  });

  it("no rompe si faltan campos", () => {
    const bg: Open5eTrasfondo = { name: "Misterioso" };
    expect(habilidadesTrasfondo(bg)).toEqual([]);
    expect(herramientasTrasfondo(bg)).toEqual([]);
    expect(idiomasElegiblesTrasfondo(bg)).toBe(0);
  });
});

describe("nombreRasgoTrasfondo", () => {
  it("usa el campo feature si existe", () => {
    expect(nombreRasgoTrasfondo({ name: "Acolyte", feature: "Shelter of the Faithful" })).toBe(
      "Shelter of the Faithful"
    );
  });

  it("cae al nombre del trasfondo si no hay feature", () => {
    expect(nombreRasgoTrasfondo({ name: "Acolyte" })).toBe("Acolyte");
  });
});

describe("descripcionDote", () => {
  it("recorta espacios y devuelve vacío si no hay desc ni benefits", () => {
    expect(descripcionDote({ name: "Alert", desc: "  Texto  " })).toBe("Texto");
    expect(descripcionDote({ name: "Alert" })).toBe("");
  });

  it("junta desc con cada benefits[].desc (esquema real confirmado contra v2)", () => {
    expect(
      descripcionDote({
        name: "Ace Driver",
        desc: "You are a virtuoso of driving vehicles.",
        benefits: [{ desc: "You gain an expertise die on ability checks." }, { desc: "You can use your reaction." }],
      })
    ).toBe(
      "You are a virtuoso of driving vehicles. You gain an expertise die on ability checks. You can use your reaction."
    );
  });

  it("usa solo benefits cuando desc viene vacío (caso real: Crossbow Expertise)", () => {
    expect(
      descripcionDote({
        name: "Crossbow Expertise",
        desc: "",
        benefits: [{ desc: "If proficient with a crossbow, you ignore its loading property." }],
      })
    ).toBe("If proficient with a crossbow, you ignore its loading property.");
  });
});
