import { notFound } from "next/navigation";

import { getCharacter } from "@/actions/characters";
import { ShareSheet } from "@/components/sheet/share-sheet";
import { FullSheet } from "@/components/sheet/full-sheet";
import { MarkActiveCharacter } from "@/components/sheet/mark-active-character";

export default async function CharacterSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = await getCharacter(id);

  if (!character) notFound();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <MarkActiveCharacter id={character.id} />
      <ShareSheet character={character} />
      <FullSheet character={character} />
    </div>
  );
}
