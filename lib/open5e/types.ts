export interface RespuestaPaginadaOpen5e<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Open5eError {
  error: string;
}
