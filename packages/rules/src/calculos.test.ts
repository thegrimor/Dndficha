import { describe, expect, it } from "vitest";

import {
  bonificadorCompetencia,
  bonoAtaqueHechizo,
  bonoConCompetencia,
  cdSalvacionHechizo,
  claseArmadura,
  iniciativa,
  modificador,
  modificadorConSigno,
  puntosGolpeIniciales,
} from "./calculos";

describe("modificador", () => {
  it("calcula floor((score-10)/2)", () => {
    expect(modificador(10)).toBe(0);
    expect(modificador(11)).toBe(0);
    expect(modificador(12)).toBe(1);
    expect(modificador(8)).toBe(-1);
    expect(modificador(20)).toBe(5);
    expect(modificador(1)).toBe(-5);
  });

  it("formatea con signo", () => {
    expect(modificadorConSigno(16)).toBe("+3");
    expect(modificadorConSigno(8)).toBe("-1");
    expect(modificadorConSigno(10)).toBe("+0");
  });
});

describe("bonificadorCompetencia", () => {
  it("sigue la tabla de progresión del PHB", () => {
    expect(bonificadorCompetencia(1)).toBe(2);
    expect(bonificadorCompetencia(4)).toBe(2);
    expect(bonificadorCompetencia(5)).toBe(3);
    expect(bonificadorCompetencia(9)).toBe(4);
    expect(bonificadorCompetencia(13)).toBe(5);
    expect(bonificadorCompetencia(17)).toBe(6);
    expect(bonificadorCompetencia(20)).toBe(6);
  });
});

describe("bonoConCompetencia", () => {
  it("sin competencia solo aplica el modificador", () => {
    expect(bonoConCompetencia(14, 1, false)).toBe(2);
  });

  it("con competencia suma el bonificador de competencia", () => {
    expect(bonoConCompetencia(14, 1, true)).toBe(4);
  });

  it("con pericia (experto) duplica el bonificador de competencia", () => {
    expect(bonoConCompetencia(14, 5, true, true)).toBe(2 + 3 * 2);
  });
});

describe("iniciativa y CA", () => {
  it("iniciativa es el mod de DEX", () => {
    expect(iniciativa(14)).toBe(2);
  });

  it("CA sin armadura es 10 + mod DEX", () => {
    expect(claseArmadura(14)).toBe(12);
  });

  it("CA con armadura y escudo suma ambos bonos", () => {
    expect(claseArmadura(14, 14, 2)).toBe(18);
  });
});

describe("hechizos", () => {
  it("CD de salvación = 8 + competencia + mod característica", () => {
    expect(cdSalvacionHechizo(5, 3)).toBe(8 + 3 + 3);
  });

  it("bono de ataque = competencia + mod característica", () => {
    expect(bonoAtaqueHechizo(5, 3)).toBe(3 + 3);
  });
});

describe("puntosGolpeIniciales", () => {
  it("es el dado de golpe máximo + mod CON", () => {
    expect(puntosGolpeIniciales(8, 14)).toBe(10);
  });
});
