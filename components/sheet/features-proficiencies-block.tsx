"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateCharacter } from "@/actions/characters";
import { EditControls } from "@/components/sheet/edit-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CharacterSheet, CharacterDto } from "@dndficha/rules";

type Feature = CharacterSheet["features"][number];

export function FeaturesProficienciesBlock({
  character,
  readOnly = false,
}: {
  character: CharacterDto;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const [features, setFeatures] = useState<Feature[]>(() => character.sheet.features);
  const [languages, setLanguages] = useState<string[]>(() => character.sheet.languages);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureDescription, setNewFeatureDescription] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  function cancel() {
    setFeatures(character.sheet.features);
    setLanguages(character.sheet.languages);
    setNewFeatureName("");
    setNewFeatureDescription("");
    setNewLanguage("");
    setEditing(false);
  }

  function save() {
    startSaving(async () => {
      const sheet: CharacterSheet = { ...character.sheet, features: features, languages: languages };
      await updateCharacter(character.id, { sheet });
      router.refresh();
      setEditing(false);
    });
  }

  function deleteFeature(i: number) {
    setFeatures((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addFeature() {
    if (!newFeatureName.trim()) return;
    setFeatures((prev) => [
      ...prev,
      { name: newFeatureName.trim(), description: newFeatureDescription.trim() },
    ]);
    setNewFeatureName("");
    setNewFeatureDescription("");
  }

  function deleteLanguage(i: number) {
    setLanguages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addLanguage() {
    if (!newLanguage.trim()) return;
    setLanguages((prev) => [...prev, newLanguage.trim()]);
    setNewLanguage("");
  }

  const featureList = editing ? features : character.sheet.features;
  const languageList = editing ? languages : character.sheet.languages;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Rasgos, competencias e idiomas</CardTitle>
        {!readOnly && (
          <EditControls
            editing={editing}
            saving={saving}
            onEdit={() => setEditing(true)}
            onCancel={cancel}
            onSave={save}
          />
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <div>
          <h4 className="font-medium">Rasgos</h4>
          {featureList.length === 0 ? (
            <p className="text-muted-foreground">Sin rasgos registrados.</p>
          ) : editing ? (
            <ul className="flex flex-col gap-1">
              {featureList.map((feature, i) => (
                <li key={i} className="flex items-start justify-between gap-2 border-b border-border py-1">
                  <span>
                    <span className="font-medium">{feature.name}:</span> {feature.description}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFeature(i)}
                    aria-label={`Quitar rasgo ${feature.name}`}
                  >
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="list-inside list-disc">
              {featureList.map((feature, i) => (
                <li key={i}>
                  <span className="font-medium">{feature.name}:</span> {feature.description}
                </li>
              ))}
            </ul>
          )}
          {editing && (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex flex-col gap-1 sm:flex-row">
                <div className="flex flex-1 flex-col gap-1">
                  <label htmlFor="feature-new-name" className="text-xs font-medium uppercase text-muted-foreground">
                    Nombre
                  </label>
                  <Input
                    id="feature-new-name"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    placeholder="Ej. Visión en la oscuridad"
                  />
                </div>
                <div className="flex flex-[2] flex-col gap-1">
                  <label
                    htmlFor="feature-new-description"
                    className="text-xs font-medium uppercase text-muted-foreground"
                  >
                    Descripción
                  </label>
                  <Input
                    id="feature-new-description"
                    value={newFeatureDescription}
                    onChange={(e) => setNewFeatureDescription(e.target.value)}
                    placeholder="Descripción breve"
                  />
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFeature} className="self-start">
                Añadir rasgo
              </Button>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium">Idiomas</h4>
          {editing ? (
            <ul className="flex flex-wrap gap-2">
              {languageList.map((language, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => deleteLanguage(i)}
                    aria-label={`Quitar idioma ${language}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              {languageList.length > 0 ? languageList.join(", ") : "Ninguno registrado."}
            </p>
          )}
          {editing && (
            <div className="mt-2 flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="language-new" className="text-xs font-medium uppercase text-muted-foreground">
                  Añadir idioma
                </label>
                <Input
                  id="language-new"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Ej. Élfico"
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                Añadir
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
