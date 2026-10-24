/**
 * D&D 5e rules edition to query in Open5e v2, via the `document__key`
 * filter. Confirmed in production: `srd-2014` and `srd-2024` exist as
 * separate documents and the filter does restrict results (unlike
 * `level`/`school`/`type`, which Open5e ignores).
 */
export type DndEdition = "2014" | "2024";

export const DOCUMENT_KEY_BY_EDITION: Record<DndEdition, string> = {
  "2014": "srd-2014",
  "2024": "srd-2024",
};

export const DND_EDITIONS: Array<{ value: DndEdition; label: string }> = [
  { value: "2014", label: "D&D 5e (2014)" },
  { value: "2024", label: "D&D 5e (2024 / \"5.5\")" },
];

export function editionFromParam(value: string | null): DndEdition {
  return value === "2024" ? "2024" : "2014";
}
