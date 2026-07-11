/**
 * Mapa de endpoints de la API pública de Open5e (SRD 5e).
 *
 * La ruta sin versión (`api.open5e.com/spells/`) devuelve 404: la API real
 * exige el prefijo `/v1/` (confirmado en producción contra
 * https://api.open5e.com/v1/spells/). Se mantiene v1 para los recursos que
 * no necesitan distinguir edición (weapons/armor/races/classes/etc.).
 *
 * Para hechizos y objetos mágicos se usa v2 (ver OPEN5E_V2_*), porque v2 es
 * la única versión que separa el contenido de la SRD 2014 y la SRD 2024
 * ("5.5"/One D&D) por documento (`document__key=srd-2014` vs `srd-2024`,
 * confirmado en producción). v1 solo tiene la SRD 2014.
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

export const OPEN5E_V2_BASE_URL = "https://api.open5e.com/v2/";

export const OPEN5E_V2_RECURSOS = {
  spells: "spells/",
  magicitems: "magicitems/",
} as const;

export type RecursoOpen5eV2 = keyof typeof OPEN5E_V2_RECURSOS;

export function construirUrlOpen5eV2(
  recurso: RecursoOpen5eV2,
  params: Record<string, string | number | undefined>
): string {
  const url = new URL(OPEN5E_V2_RECURSOS[recurso], OPEN5E_V2_BASE_URL);
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== "") {
      url.searchParams.set(clave, String(valor));
    }
  }
  return url.toString();
}
