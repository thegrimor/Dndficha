import { describe, expect, it } from "vitest";

import { doteLocalDesdeNombreIngles } from "@/lib/dnd/dotes";

describe("doteLocalDesdeNombreIngles", () => {
  it("empareja un nombre simple", () => {
    expect(doteLocalDesdeNombreIngles("Alert")?.nombre).toBe("Alerta");
    expect(doteLocalDesdeNombreIngles("Tough")?.nombre).toBe("Duro");
  });

  it("ignora el paréntesis de variante de clase (Magic Initiate)", () => {
    expect(doteLocalDesdeNombreIngles("Magic Initiate (Cleric)")?.nombre).toBe("Iniciado en magia");
    expect(doteLocalDesdeNombreIngles("Magic Initiate (Wizard)")?.nombre).toBe("Iniciado en magia");
  });

  it("no distingue mayúsculas/minúsculas", () => {
    expect(doteLocalDesdeNombreIngles("savage attacker")?.nombre).toBe("Atacante salvaje");
  });

  it("undefined si el trasfondo da una dote fuera del catálogo de origen", () => {
    expect(doteLocalDesdeNombreIngles("Grappler")).toBeUndefined();
  });
});
