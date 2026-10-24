import type { EdicionDnD } from "@dndficha/rules";

/** Recursos que Open5e sirve por edición (v2: separa SRD 2014 y SRD 2024). */
export const RECURSOS_POR_EDICION = ["spells", "magicitems", "backgrounds"] as const;
/** Recursos que solo existen en la SRD 2014 (v1). */
export const RECURSOS_SIN_EDICION = ["weapons", "armor", "races", "classes", "feats"] as const;

export type RecursoPorEdicion = (typeof RECURSOS_POR_EDICION)[number];
export type RecursoSinEdicion = (typeof RECURSOS_SIN_EDICION)[number];
export type RecursoCatalogo = RecursoPorEdicion | RecursoSinEdicion;

export const RECURSOS_CATALOGO: readonly RecursoCatalogo[] = [...RECURSOS_POR_EDICION, ...RECURSOS_SIN_EDICION];

export const esRecursoPorEdicion = (r: RecursoCatalogo): r is RecursoPorEdicion =>
  (RECURSOS_POR_EDICION as readonly string[]).includes(r);

export interface BusquedaMonstruos {
  search?: string;
  limit?: number;
  offset?: number;
  type?: string;
  cr?: string;
}

export interface PaginaOpen5e {
  count: number;
  next: string | null;
  previous: string | null;
  results: unknown[];
}

/** Puerto hacia la fuente externa (Open5e). Lanza `DomainError` unavailable si no responde. */
export interface Open5eGateway {
  listarCompleto(recurso: RecursoCatalogo, edicion: EdicionDnD): Promise<unknown[]>;
  buscarMonstruos(busqueda: BusquedaMonstruos): Promise<PaginaOpen5e>;
}

export interface CatalogCache {
  get(key: string): Promise<{ payload: unknown[]; fetchedAt: Date } | null>;
  set(key: string, payload: unknown[], fetchedAt: Date): Promise<void>;
}
