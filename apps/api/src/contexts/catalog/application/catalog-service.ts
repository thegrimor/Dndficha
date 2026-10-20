import { identificadorOpen5e, type EdicionDnD, type Open5eTrasfondo } from "@dndficha/rules";

import { DomainError } from "../../../shared-kernel/domain-error";
import {
  esRecursoPorEdicion,
  type BusquedaMonstruos,
  type CatalogCache,
  type Open5eGateway,
  type RecursoCatalogo,
} from "../domain/catalog";

const TTL_FRESCO_MS = 6 * 60 * 60 * 1000;

export class CatalogService {
  private enVuelo = new Map<string, Promise<unknown[]>>();

  constructor(
    private gateway: Open5eGateway,
    private cache: CatalogCache,
    private now: () => Date = () => new Date()
  ) {}

  /**
   * Catálogo completo de un recurso. Sirve de caché mientras esté fresco; si
   * Open5e falla y hay una copia caducada, se devuelve esa antes que un error.
   */
  async listar(recurso: RecursoCatalogo, edicion: EdicionDnD): Promise<unknown[]> {
    const edicionEfectiva = esRecursoPorEdicion(recurso) ? edicion : "2014";
    const key = `${recurso}:${edicionEfectiva}`;

    const guardado = await this.cache.get(key);
    if (guardado && this.now().getTime() - guardado.fetchedAt.getTime() < TTL_FRESCO_MS) {
      return guardado.payload;
    }

    // Peticiones concurrentes al mismo recurso comparten una sola llamada a Open5e.
    let pendiente = this.enVuelo.get(key);
    if (!pendiente) {
      pendiente = this.refrescar(key, recurso, edicionEfectiva).finally(() => this.enVuelo.delete(key));
      this.enVuelo.set(key, pendiente);
    }

    try {
      return await pendiente;
    } catch (error) {
      if (guardado) return guardado.payload;
      throw error;
    }
  }

  buscarMonstruos(busqueda: BusquedaMonstruos) {
    return this.gateway.buscarMonstruos(busqueda);
  }

  /** Trasfondo del catálogo por el id que usa el wizard (slug, key o nombre). */
  async obtenerTrasfondo(edicion: EdicionDnD, id: string): Promise<Open5eTrasfondo> {
    const trasfondos = (await this.listar("backgrounds", edicion)) as Open5eTrasfondo[];
    const encontrado = trasfondos.find((t) => identificadorOpen5e(t) === id);
    if (!encontrado) throw new DomainError("not_found", "El trasfondo elegido no existe en el catálogo", "background_not_found");
    return encontrado;
  }

  private async refrescar(key: string, recurso: RecursoCatalogo, edicion: EdicionDnD): Promise<unknown[]> {
    const payload = await this.gateway.listarCompleto(recurso, edicion);
    await this.cache.set(key, payload, this.now());
    return payload;
  }
}
