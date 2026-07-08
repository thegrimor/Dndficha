/**
 * Mapa de endpoints de la API pública de Open5e (SRD 5e).
 *
 * IMPORTANTE: `api.open5e.com` no fue alcanzable desde este entorno de
 * desarrollo (bloqueado por la política de red de salida), así que estas
 * rutas no se pudieron verificar en vivo. Están basadas en el contrato
 * documentado de Open5e v1, que es el más estable. Antes de depender de
 * ellas en producción, confirmar contra https://open5e.com/api-docs y
 * ajustar aquí si el contrato real difiere (p.ej. si conviene migrar a v2
 * para usar `?fields=` y reducir el payload).
 */

export const OPEN5E_BASE_URL = "https://api.open5e.com";

export const OPEN5E_RECURSOS = {
  spells: "/spells/",
  weapons: "/weapons/",
  armor: "/armor/",
  magicitems: "/magicitems/",
  races: "/races/",
  classes: "/classes/",
  backgrounds: "/backgrounds/",
  feats: "/feats/",
  monsters: "/monsters/",
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
