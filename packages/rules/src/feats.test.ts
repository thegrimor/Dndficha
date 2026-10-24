import { describe, expect, it } from "vitest";

import { localFeatFromEnglishName } from "./feats";

describe("localFeatFromEnglishName", () => {
  it("matches a simple name", () => {
    expect(localFeatFromEnglishName("Alert")?.name).toBe("Alerta");
    expect(localFeatFromEnglishName("Tough")?.name).toBe("Duro");
  });

  it("ignores the class variant parenthesis (Magic Initiate)", () => {
    expect(localFeatFromEnglishName("Magic Initiate (Cleric)")?.name).toBe("Iniciado en magia");
    expect(localFeatFromEnglishName("Magic Initiate (Wizard)")?.name).toBe("Iniciado en magia");
  });

  it("is case-insensitive", () => {
    expect(localFeatFromEnglishName("savage attacker")?.name).toBe("Atacante salvaje");
  });

  it("undefined if the background grants a feat outside the origin catalog", () => {
    expect(localFeatFromEnglishName("Grappler")).toBeUndefined();
  });
});
