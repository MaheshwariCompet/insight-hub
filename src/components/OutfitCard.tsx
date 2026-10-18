import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ItemThumb } from "./AddItemDialog";
import { Button } from "./ui/button";
import { useStore } from "@/lib/store";
import { outfitKey, type ScoreResult } from "@/lib/wardrobe";

export function OutfitCard({ outfit, choose }: { outfit: ScoreResult; choose?: () => void }) {
  const { favorites, toggleFavorite } = useStore();
  const key = outfitKey(outfit), liked = favorites.includes(key);
  return <article className="fit-card overflow-hidden">
    <div className="relative grid grid-cols-2 gap-px bg-muted"><ItemThumb item={outfit.top} size="h-52 w-full !rounded-none !border-0" /><ItemThumb item={outfit.bottom} size="h-52 w-full !rounded-none !border-0" /><Button title={liked ? "Remove favorite" : "Save favorite"} aria-label={liked ? "Remove favorite" : "Save favorite"} aria-pressed={liked} size="icon" variant="secondary" className="absolute right-3 top-3" onClick={() => toggleFavorite(key)}><Heart className={liked ? "fill-primary text-primary" : ""} /></Button></div>
    <div className="p-4"><div className="flex items-center justify-between gap-2"><span className="eyebrow">{outfit.rainRisk ? "Check rain suitability" : "Everyday combination"}</span>{outfit.shoes && <ItemThumb item={outfit.shoes} size="h-9 w-9" />}</div><h3 className="mt-2 text-base font-semibold">{outfit.top.name}</h3><p className="text-sm text-muted-foreground">{outfit.bottom.name}</p><div className="mt-4">{choose ? <Button variant="outline" className="w-full" onClick={choose}>Choose this outfit</Button> : <Button asChild variant="link" className="h-auto px-0"><Link to="/planner" search={{ outfit: key }}>Plan this outfit →</Link></Button>}</div></div>
  </article>;
}