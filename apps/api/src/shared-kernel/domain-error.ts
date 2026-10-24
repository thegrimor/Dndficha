export type DomainErrorKind = "validation" | "not_found" | "conflict" | "unauthorized" | "forbidden" | "unavailable";

/** Business error: thrown by the domain/application layers and translated to a status by the HTTP layer. */
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

export const STATUS_BY_KIND: Record<DomainErrorKind, number> = {
  validation: 422,
  not_found: 404,
  conflict: 409,
  unauthorized: 401,
  forbidden: 403,
  unavailable: 503,
};
