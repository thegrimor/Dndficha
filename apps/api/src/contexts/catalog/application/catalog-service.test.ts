import { describe, expect, it } from "vitest";

import { DomainError } from "../../../shared-kernel/domain-error";
import type { CatalogCache, Open5eGateway } from "../domain/catalog";
import { CatalogService } from "./catalog-service";

function inMemory(): CatalogCache {
  const m = new Map<string, { payload: unknown[]; fetchedAt: Date }>();
  return {
    get: async (k) => m.get(k) ?? null,
    set: async (k, payload, fetchedAt) => void m.set(k, { payload, fetchedAt }),
  };
}

const gateway = (result: () => Promise<unknown[]>): Open5eGateway & { n: number } => {
  const g = {
    n: 0,
    listAll: async () => {
      g.n++;
      return result();
    },
    searchMonsters: async () => ({ count: 0, next: null, previous: null, results: [] }),
  };
  return g;
};

describe("CatalogService", () => {
  it("collapses concurrent requests into a single Open5e call", async () => {
    const g = gateway(async () => [1, 2]);
    const service = new CatalogService(g, inMemory());
    await Promise.all([service.list("spells", "2014"), service.list("spells", "2014"), service.list("spells", "2014")]);
    expect(g.n).toBe(1);
  });

  it("serves the stale copy if Open5e fails", async () => {
    let now = new Date("2026-01-01T00:00:00Z");
    let failing = false;
    const g = gateway(async () => {
      if (failing) throw new DomainError("unavailable", "down");
      return ["viejo"];
    });
    const service = new CatalogService(g, inMemory(), () => now);

    await service.list("spells", "2014");
    now = new Date("2026-01-02T00:00:00Z"); // past the TTL
    failing = true;
    expect(await service.list("spells", "2014")).toEqual(["viejo"]);
  });

  it("propagates the error if there is no copy", async () => {
    const service = new CatalogService(gateway(async () => { throw new DomainError("unavailable", "down"); }), inMemory());
    await expect(service.list("spells", "2014")).rejects.toMatchObject({ kind: "unavailable" });
  });

  it("ignores the edition for resources that only exist in 2014", async () => {
    const g = gateway(async () => [1]);
    const service = new CatalogService(g, inMemory());
    await service.list("races", "2014");
    await service.list("races", "2024");
    expect(g.n).toBe(1);
  });
});
