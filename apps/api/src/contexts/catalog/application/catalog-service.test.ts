import { describe, expect, it } from "vitest";

import { DomainError } from "../../../shared-kernel/domain-error";
import type { CatalogCache, Open5eGateway } from "../domain/catalog";
import { CatalogService } from "./catalog-service";

function memoria(): CatalogCache {
  const m = new Map<string, { payload: unknown[]; fetchedAt: Date }>();
  return {
    get: async (k) => m.get(k) ?? null,
    set: async (k, payload, fetchedAt) => void m.set(k, { payload, fetchedAt }),
  };
}

const gateway = (resultado: () => Promise<unknown[]>): Open5eGateway & { n: number } => {
  const g = {
    n: 0,
    listarCompleto: async () => {
      g.n++;
      return resultado();
    },
    buscarMonstruos: async () => ({ count: 0, next: null, previous: null, results: [] }),
  };
  return g;
};

describe("CatalogService", () => {
  it("colapsa peticiones concurrentes en una sola llamada a Open5e", async () => {
    const g = gateway(async () => [1, 2]);
    const servicio = new CatalogService(g, memoria());
    await Promise.all([servicio.listar("spells", "2014"), servicio.listar("spells", "2014"), servicio.listar("spells", "2014")]);
    expect(g.n).toBe(1);
  });

  it("sirve la copia caducada si Open5e falla", async () => {
    let ahora = new Date("2026-01-01T00:00:00Z");
    let falla = false;
    const g = gateway(async () => {
      if (falla) throw new DomainError("unavailable", "caído");
      return ["viejo"];
    });
    const servicio = new CatalogService(g, memoria(), () => ahora);

    await servicio.listar("spells", "2014");
    ahora = new Date("2026-01-02T00:00:00Z"); // pasa el TTL
    falla = true;
    expect(await servicio.listar("spells", "2014")).toEqual(["viejo"]);
  });

  it("propaga el error si no hay copia", async () => {
    const servicio = new CatalogService(gateway(async () => { throw new DomainError("unavailable", "caído"); }), memoria());
    await expect(servicio.listar("spells", "2014")).rejects.toMatchObject({ kind: "unavailable" });
  });

  it("ignora la edición en recursos que solo existen en 2014", async () => {
    const g = gateway(async () => [1]);
    const servicio = new CatalogService(g, memoria());
    await servicio.listar("races", "2014");
    await servicio.listar("races", "2024");
    expect(g.n).toBe(1);
  });
});
