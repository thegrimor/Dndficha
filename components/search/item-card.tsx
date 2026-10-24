import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddToSheetButton } from "@/components/search/add-to-sheet-button";
import {
  attunementDetail,
  itemCategoryName,
  itemRarityName,
  type Open5eMagicItem,
} from "@dndficha/rules";

interface ItemCardProps {
  item: Open5eMagicItem;
  forcedCharacterId?: string;
}

export function ItemCard({ item, forcedCharacterId }: ItemCardProps) {
  const rarity = itemRarityName(item);
  const attunement = attunementDetail(item);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="normal-case tracking-normal text-base font-semibold">
          {item.name}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {itemCategoryName(item)}
          {rarity && ` · ${rarity}`}
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
        {attunement && (
          <p>
            <span className="font-medium text-foreground">Sintonización:</span> {attunement}
          </p>
        )}
        {item.desc && <p className="line-clamp-5">{item.desc}</p>}
        <div className="mt-auto pt-2">
          <AddToSheetButton type="item" item={item} forcedCharacterId={forcedCharacterId} />
        </div>
      </CardContent>
    </Card>
  );
}
