import { DOCUMENT_KEY_POR_EDICION, type EdicionDnD } from "@dndficha/rules";

import { DomainError } from "../../../shared-kernel/domain-error";
import { esRecursoPorEdicion, type BusquedaMonstruos, type Open5eGateway, type PaginaOpen5e, type RecursoCatalogo } from "../domain/catalog";

const BASE_V1 = "https://api.open5e.com/v1/";
const BASE_V2 = "https://api.open5e.com/v2/";
const TIMEOUT_MS = 8000;
const TAMANO_PAGINA = 100;
const MAX_PAGINAS = 30;
const PRESUPUESTO_TOTAL_MS = 45_000;

type Fetch = typeof fetch;

/**
 * Anti-corruption layer hacia Open5e: encapsula las diferencias v1/v2, el
 * filtrado por documento (edición) y los fallos de red.
 *
 * Los filtros `search`/`level`/`school`/`type` no siempre se aplican del lado
 * de Open5e, así que se baja el catálogo completo (cacheado en el servicio) y
 * el cliente filtra. La excepción son los monstruos, demasiados para agregar.
 */
export class Open5eHttpGateway implements Open5eGateway {
  constructor(private fetchFn: Fetch = fetch) {}

  async listarCompleto(recurso: RecursoCatalogo, edicion: EdicionDnD): Promise<unknown[]> {
    const v2 = esRecursoPorEdicion(recurso);
    const base = v2 ? BASE_V2 : BASE_V1;
    const resultados: unknown[] = [];
    const inicio = Date.now();

    for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
      if (Date.now() - inicio > PRESUPUESTO_TOTAL_MS) {
        throw new DomainError("unavailable", `Open5e tardó demasiado agregando ${recurso}`, "open5e_unavailable");
      }
      const url = new URL(`${recurso}/`, base);
      url.searchParams.set("limit", String(TAMANO_PAGINA));
      url.searchParams.set("offset", String(pagina * TAMANO_PAGINA));
      if (v2) url.searchParams.set("document__key", DOCUMENT_KEY_POR_EDICION[edicion]);

      const datos = await this.pedir(url.toString());
      resultados.push(...datos.results);
      if (!datos.next || datos.results.length === 0) break;
    }
    return resultados;
  }

  buscarMonstruos(busqueda: BusquedaMonstruos): Promise<PaginaOpen5e> {
    const url = new URL("monsters/", BASE_V1);
    for (const [clave, valor] of Object.entries(busqueda)) {
      if (valor !== undefined && valor !== "") url.searchParams.set(clave, String(valor));
    }
    return this.pedir(url.toString());
  }

  private async pedir(url: string): Promise<PaginaOpen5e> {
    try {
      return await this.intentar(url);
    } catch {
      try {
        return await this.intentar(url);
      } catch {
        throw new DomainError("unavailable", "Open5e no está disponible", "open5e_unavailable");
      }
    }
  }

  private async intentar(url: string): Promise<PaginaOpen5e> {
    const respuesta = await this.fetchFn(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!respuesta.ok) throw new Error(`Open5e respondió ${respuesta.status} para ${url}`);
    return (await respuesta.json()) as PaginaOpen5e;
  }
}
