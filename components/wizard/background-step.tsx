"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SKILLS, ABILITY_NAMES, type Ability } from "@dndficha/rules";
import { AVAILABLE_LANGUAGES, RACES_SRD } from "@dndficha/rules";
import { FEATS_SRD, localFeatFromEnglishName } from "@dndficha/rules";
import { backgroundFromOpen5e } from "@dndficha/rules";
import type { ChosenBackgroundBonus } from "@dndficha/rules";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Open5eCatalogLoading,
  Open5eCatalogError,
  Open5eNoResults,
} from "@/components/search/open5e-status";
import { OptionCard } from "@/components/wizard/option-card";
import type { WizardData, ChosenOriginFeat } from "@/components/wizard/types";
import { open5eIdentifier, backgroundFeatName, type Open5eBackground } from "@dndficha/rules";

const INITIAL_BACKGROUND_BONUS: ChosenBackgroundBonus = { mode: "split", plus2: null, plus1: null };
const INITIAL_FEAT: ChosenOriginFeat = { mode: "catalog", chosenFeat: null, manualName: "", manualDescription: "" };
const CLIENT_TIMEOUT_MS = 15000;
const SUBTITLE_MAX_LENGTH = 140;

function truncate(text: string, length: number): string {
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

async function fetchOpen5eCatalog<T>(resource: "backgrounds", edition: string): Promise<T[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const response = await fetch(`/api/open5e/${resource}?edition=${edition}`, { signal: controller.signal });
    if (!response.ok) throw new Error("open5e_unavailable");
    const data = (await response.json()) as { results: T[] };
    return data.results;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function BackgroundStep({
  data,
  update,
}: {
  data: WizardData;
  update: (changes: Partial<WizardData>) => void;
}) {
  const background = data.backgroundData;
  const race = RACES_SRD.find((r) => r.id === data.raceId);
  const alreadyKnownLanguages = new Set(race?.languages ?? []);
  const choosableLanguages = AVAILABLE_LANGUAGES.filter((language) => !alreadyKnownLanguages.has(language));
  const is2024 = data.edition === "2024";
  const bonusOptions = background?.abilityBonusOptions ?? [];

  const [backgroundText, setBackgroundText] = useState("");
  const debouncedBackgroundText = useDebounce(backgroundText, 200);

  const {
    data: open5eBackgrounds,
    isLoading: loadingBackgrounds,
    isError: backgroundsError,
    refetch: retryBackgrounds,
  } = useQuery({
    queryKey: ["open5e", "backgrounds", "full", data.edition],
    queryFn: () => fetchOpen5eCatalog<Open5eBackground>("backgrounds", data.edition),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  const filteredBackgrounds = useMemo(() => {
    if (!open5eBackgrounds) return [];
    const text = debouncedBackgroundText.trim().toLowerCase();
    const list = text ? open5eBackgrounds.filter((bg) => bg.name.toLowerCase().includes(text)) : open5eBackgrounds;
    return list.map((bg) => ({ bg, normalized: backgroundFromOpen5e(bg) }));
  }, [open5eBackgrounds, debouncedBackgroundText]);

  const selectedBackground = open5eBackgrounds?.find((bg) => open5eIdentifier(bg) === data.backgroundId);
  const backgroundFeatLabel = selectedBackground ? backgroundFeatName(selectedBackground) : undefined;

  const [featText, setFeatText] = useState("");
  const debouncedFeatText = useDebounce(featText, 200);

  const filteredFeats = useMemo(() => {
    const text = debouncedFeatText.trim().toLowerCase();
    return text ? FEATS_SRD.filter((feat) => feat.name.toLowerCase().includes(text)) : FEATS_SRD;
  }, [debouncedFeatText]);

  function selectBackground(bg: Open5eBackground) {
    const englishFeatName = backgroundFeatName(bg);
    const suggestedFeat = englishFeatName ? localFeatFromEnglishName(englishFeatName) : undefined;

    update({
      backgroundId: open5eIdentifier(bg),
      backgroundData: backgroundFromOpen5e(bg),
      chosenBackgroundLanguages: [],
      backgroundBonus: INITIAL_BACKGROUND_BONUS,
      originFeat: suggestedFeat
        ? { ...INITIAL_FEAT, chosenFeat: { name: suggestedFeat.name, description: suggestedFeat.description } }
        : { ...INITIAL_FEAT, mode: "manual", manualName: englishFeatName ?? "" },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Buscar trasfondo por nombre..."
        value={backgroundText}
        onChange={(e) => setBackgroundText(e.target.value)}
        className="sm:max-w-xs"
      />

      {backgroundsError && <Open5eCatalogError onRetry={() => retryBackgrounds()} />}
      {!backgroundsError && loadingBackgrounds && <Open5eCatalogLoading />}
      {!backgroundsError && !loadingBackgrounds && filteredBackgrounds.length === 0 && <Open5eNoResults />}

      {!backgroundsError && filteredBackgrounds.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBackgrounds.map(({ bg, normalized }) => (
            <OptionCard
              key={open5eIdentifier(bg)}
              selected={open5eIdentifier(bg) === data.backgroundId}
              onClick={() => selectBackground(bg)}
              title={normalized.name}
              subtitle={
                normalized.skillProficiencies.length > 0
                  ? normalized.skillProficiencies
                      .map((id) => SKILLS.find((h) => h.id === id)?.name ?? id)
                      .join(", ")
                  : truncate(bg.desc ?? "", SUBTITLE_MAX_LENGTH)
              }
            />
          ))}
        </div>
      )}

      {background && background.feature.description && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-1 font-medium">Equipo inicial</h4>
          <p className="text-muted-foreground">{background.feature.description}</p>
        </div>
      )}

      {background && background.languageChoiceCount > 0 && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-2 font-medium">
            Elige {background.languageChoiceCount} idioma(s) adicional(es)
            {" "}
            ({data.chosenBackgroundLanguages.length}/{background.languageChoiceCount})
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {choosableLanguages.map((language) => {
              const checked = data.chosenBackgroundLanguages.includes(language);
              const limitReached =
                data.chosenBackgroundLanguages.length >= background.languageChoiceCount;
              return (
                <label
                  key={language}
                  className={cn(
                    "flex items-center gap-1.5 text-sm",
                    !checked && limitReached && "opacity-40"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && limitReached}
                    onChange={() => {
                      const nextSelection = checked
                        ? data.chosenBackgroundLanguages.filter((i) => i !== language)
                        : [...data.chosenBackgroundLanguages, language];
                      update({ chosenBackgroundLanguages: nextSelection });
                    }}
                    className="h-4 w-4 rounded border-border"
                  />
                  {language}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {is2024 && background && bonusOptions.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-2 font-medium">Bonificador de característica del trasfondo</h4>
          <div className="mb-3 flex gap-2">
            {(["split", "even"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  update({
                    backgroundBonus: { mode, plus2: null, plus1: null },
                  })
                }
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  data.backgroundBonus.mode === mode
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                {mode === "split" ? "+2 a una, +1 a otra" : "+1 a las tres"}
              </button>
            ))}
          </div>

          {data.backgroundBonus.mode === "split" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Característica principal (+2)
                </span>
                <select
                  value={data.backgroundBonus.plus2 ?? ""}
                  onChange={(e) => {
                    const plus2 = (e.target.value || null) as Ability | null;
                    const plus1 = data.backgroundBonus.plus1 === plus2 ? null : data.backgroundBonus.plus1;
                    update({ backgroundBonus: { ...data.backgroundBonus, plus2, plus1 } });
                  }}
                  className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- Elegir --</option>
                  {bonusOptions.map((ability) => (
                    <option key={ability} value={ability}>
                      {ABILITY_NAMES[ability]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Característica secundaria (+1)
                </span>
                <select
                  value={data.backgroundBonus.plus1 ?? ""}
                  onChange={(e) =>
                    update({
                      backgroundBonus: {
                        ...data.backgroundBonus,
                        plus1: (e.target.value || null) as Ability | null,
                      },
                    })
                  }
                  className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- Elegir --</option>
                  {bonusOptions
                    .filter((ability) => ability !== data.backgroundBonus.plus2)
                    .map((ability) => (
                      <option key={ability} value={ability}>
                        {ABILITY_NAMES[ability]}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          ) : (
            <p className="text-muted-foreground">
              +1 a {bonusOptions.map((ability) => ABILITY_NAMES[ability]).join(", ")}.
            </p>
          )}
        </div>
      )}

      {is2024 && background && (
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <h4 className="mb-1 font-medium">Dote de origen (nivel 1)</h4>
          {backgroundFeatLabel && (
            <p className="mb-2 text-xs text-muted-foreground">
              Tu trasfondo otorga: <span className="font-medium">{backgroundFeatLabel}</span> — ya
              preseleccionada abajo si está en el catálogo; revísala o cámbiala si hace falta.
            </p>
          )}
          <div className="mb-3 flex gap-2">
            {(["catalog", "manual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => update({ originFeat: { ...INITIAL_FEAT, mode } })}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium",
                  data.originFeat.mode === mode
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                {mode === "catalog" ? "Elegir del catálogo" : "Escribir a mano"}
              </button>
            ))}
          </div>

          {data.originFeat.mode === "catalog" ? (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="Buscar dote por nombre..."
                value={featText}
                onChange={(e) => setFeatText(e.target.value)}
                className="sm:max-w-xs"
              />

              {filteredFeats.length === 0 && <Open5eNoResults />}

              {filteredFeats.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {filteredFeats.map((feat) => (
                    <OptionCard
                      key={feat.id}
                      selected={feat.name === data.originFeat.chosenFeat?.name}
                      onClick={() =>
                        update({
                          originFeat: {
                            ...data.originFeat,
                            chosenFeat: { name: feat.name, description: feat.description },
                          },
                        })
                      }
                      title={feat.name}
                      subtitle={feat.description}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">Nombre de la dote</span>
                <Input
                  value={data.originFeat.manualName}
                  onChange={(e) =>
                    update({ originFeat: { ...data.originFeat, manualName: e.target.value } })
                  }
                  placeholder="Ej. Experto en armas de asta"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase text-muted-foreground">Descripción</span>
                <Input
                  value={data.originFeat.manualDescription}
                  onChange={(e) =>
                    update({ originFeat: { ...data.originFeat, manualDescription: e.target.value } })
                  }
                  placeholder="Qué hace esta dote"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
