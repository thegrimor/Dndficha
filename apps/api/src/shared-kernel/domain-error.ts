export type DomainErrorKind = "validation" | "not_found" | "conflict" | "unauthorized" | "forbidden";

/** Error de negocio: lo lanza el dominio/aplicación y la capa HTTP lo traduce a un status. */
export class DomainError extends Error {
  constructor(
    readonly kind: DomainErrorKind,
    message: string,
    readonly code?: string
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const STATUS_POR_TIPO: Record<DomainErrorKind, number> = {
  validation: 422,
  not_found: 404,
  conflict: 409,
  unauthorized: 401,
  forbidden: 403,
};
