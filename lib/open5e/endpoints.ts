/**
 * Mapa de endpoints de la API pública de Open5e (SRD 5e).
 *
 * La ruta sin versión (`api.open5e.com/spells/`) devuelve 404: la API real
 * exige el prefijo `/v1/` (confirmado en producción contra
 * https://api.open5e.com/v1/spells/). Se mantiene v1 para todos los
 * recursos por consistencia; si en el futuro se quiere `?fields=` de v2,
 * revisar recurso por recurso que el contrato de datos no cambie.
 */

export const OPEN5E_BASE_URL = "https://api.open5e.com/v1/";

export const OPEN5E_RECURSOS = {
  spells: "spells/",
  weapons: "weapons/",
  armor: "armor/",
  magicitems: "magicitems/",
  races: "races/",
  classes: "classes/",
  backgrounds: "backgrounds/",
  feats: "feats/",
  monsters: "monsters/",
} as const;

export type RecursoOpen5e = keyof typeof OPEN5E_RECURSOS;

export function construirUrlOpen5e(
  recurso: RecursoOpen5e,
  params: Record<string, string | number | undefined>
): string {
  const url = new URL(OPEN5E_RECURSOS[recurso], OPEN5E_BASE_URL);
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== "") {
      url.searchParams.set(clave, String(valor));
    }
  }
  return url.toString();
}
