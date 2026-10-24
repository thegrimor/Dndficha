import { DOCUMENT_KEY_BY_EDITION, type DndEdition } from "@dndficha/rules";

import { DomainError } from "../../../shared-kernel/domain-error";
import { isEditionResource, type MonsterSearchParams, type Open5eGateway, type Open5ePage, type CatalogResource } from "../domain/catalog";

const BASE_V1 = "https://api.open5e.com/v1/";
const BASE_V2 = "https://api.open5e.com/v2/";
const TIMEOUT_MS = 8000;
const PAGE_SIZE = 100;
const MAX_PAGES = 30;
const TOTAL_BUDGET_MS = 45_000;

type Fetch = typeof fetch;

/**
 * Anti-corruption layer towards Open5e: encapsulates the v1/v2 differences,
 * filtering by document (edition) and network failures.
 *
 * The `search`/`level`/`school`/`type` filters are not always applied on the
 * Open5e side, so the full catalog is downloaded (cached in the service) and
 * the client filters. Monsters are the exception: too many to aggregate.
 */
export class Open5eHttpGateway implements Open5eGateway {
  constructor(private fetchFn: Fetch = fetch) {}

  async listAll(resource: CatalogResource, edition: DndEdition): Promise<unknown[]> {
    const v2 = isEditionResource(resource);
    const base = v2 ? BASE_V2 : BASE_V1;
    const results: unknown[] = [];
    const startedAt = Date.now();

    for (let page = 0; page < MAX_PAGES; page++) {
      if (Date.now() - startedAt > TOTAL_BUDGET_MS) {
        throw new DomainError("unavailable", `Open5e tardó demasiado agregando ${resource}`, "open5e_unavailable");
      }
      const url = new URL(`${resource}/`, base);
      url.searchParams.set("limit", String(PAGE_SIZE));
      url.searchParams.set("offset", String(page * PAGE_SIZE));
      if (v2) url.searchParams.set("document__key", DOCUMENT_KEY_BY_EDITION[edition]);

      const data = await this.request(url.toString());
      results.push(...data.results);
      if (!data.next || data.results.length === 0) break;
    }
    return results;
  }

  searchMonsters(query: MonsterSearchParams): Promise<Open5ePage> {
    const url = new URL("monsters/", BASE_V1);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
    return this.request(url.toString());
  }

  private async request(url: string): Promise<Open5ePage> {
    try {
      return await this.attempt(url);
    } catch {
      try {
        return await this.attempt(url);
      } catch {
        throw new DomainError("unavailable", "Open5e no está disponible", "open5e_unavailable");
      }
    }
  }

  private async attempt(url: string): Promise<Open5ePage> {
    const response = await this.fetchFn(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Open5e responded ${response.status} for ${url}`);
    return (await response.json()) as Open5ePage;
  }
}
