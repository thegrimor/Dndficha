import { open5eIdentifier, type DndEdition, type Open5eBackground } from "@dndficha/rules";

import { DomainError } from "../../../shared-kernel/domain-error";
import {
  isEditionResource,
  type MonsterSearchParams,
  type CatalogCache,
  type Open5eGateway,
  type CatalogResource,
} from "../domain/catalog";

const FRESH_TTL_MS = 6 * 60 * 60 * 1000;

export class CatalogService {
  private inFlight = new Map<string, Promise<unknown[]>>();

  constructor(
    private gateway: Open5eGateway,
    private cache: CatalogCache,
    private now: () => Date = () => new Date()
  ) {}

  /**
   * Full catalog of a resource. Served from cache while fresh; if Open5e
   * fails and a stale copy exists, that is returned instead of an error.
   */
  async list(resource: CatalogResource, edition: DndEdition): Promise<unknown[]> {
    const effectiveEdition = isEditionResource(resource) ? edition : "2014";
    const key = `${resource}:${effectiveEdition}`;

    const saved = await this.cache.get(key);
    if (saved && this.now().getTime() - saved.fetchedAt.getTime() < FRESH_TTL_MS) {
      return saved.payload;
    }

    // Concurrent requests for the same resource share a single call to Open5e.
    let pending = this.inFlight.get(key);
    if (!pending) {
      pending = this.refresh(key, resource, effectiveEdition).finally(() => this.inFlight.delete(key));
      this.inFlight.set(key, pending);
    }

    try {
      return await pending;
    } catch (error) {
      if (saved) return saved.payload;
      throw error;
    }
  }

  searchMonsters(query: MonsterSearchParams) {
    return this.gateway.searchMonsters(query);
  }

  /** Background from the catalog by the id the wizard uses (slug, key or name). */
  async getBackground(edition: DndEdition, id: string): Promise<Open5eBackground> {
    const backgrounds = (await this.list("backgrounds", edition)) as Open5eBackground[];
    const found = backgrounds.find((t) => open5eIdentifier(t) === id);
    if (!found) throw new DomainError("not_found", "El trasfondo elegido no existe en el catálogo", "background_not_found");
    return found;
  }

  private async refresh(key: string, resource: CatalogResource, edition: DndEdition): Promise<unknown[]> {
    const payload = await this.gateway.listAll(resource, edition);
    await this.cache.set(key, payload, this.now());
    return payload;
  }
}
