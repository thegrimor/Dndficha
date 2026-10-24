/**
 * Edición de reglas de D&D 5e a consultar en Open5e v2, vía el filtro
 * `document__key`. Confirmado en producción: `srd-2014` y `srd-2024`
 * existen como documentos separados y el filtro sí restringe resultados
 * (a diferencia de `level`/`school`/`type`, que Open5e ignora).
 */
export type EdicionDnD = "2014" | "2024";

export const DOCUMENT_KEY_POR_EDICION: Record<EdicionDnD, string> = {
  "2014": "srd-2014",
  "2024": "srd-2024",
};

export const EDICIONES_DND: Array<{ value: EdicionDnD; label: string }> = [
  { value: "2014", label: "D&D 5e (2014)" },
  { value: "2024", label: "D&D 5e (2024 / \"5.5\")" },
];

export function edicionDesdeParam(valor: string | null): EdicionDnD {
  return valor === "2024" ? "2024" : "2014";
}
