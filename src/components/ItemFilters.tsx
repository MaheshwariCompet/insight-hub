import { CATEGORIES, SEASONS, STYLES, seasonOf, styleOf, type Item } from "@/lib/wardrobe";
import { Button } from "./ui/button";

export interface Filters { category: string | null; season: string | null; style: string | null }
export const NO_FILTERS: Filters = { category: null, season: null, style: null };

export function applyFilters(items: Item[], f: Filters) {
  return items.filter((i) =>
    (!f.category || i.category === f.category) &&
    (!f.season || seasonOf(i) === f.season || seasonOf(i) === "All-season") &&
    (!f.style || styleOf(i) === f.style),
  );
}

export function ItemFilters({ f, setF, showCategory = true }: { f: Filters; setF: (f: Filters) => void; showCategory?: boolean }) {
  const row = (k: keyof Filters, opts: readonly string[]) => (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <Button key={o} variant={f[k] === o ? "default" : "outline"} size="sm" aria-pressed={f[k] === o} onClick={() => setF({ ...f, [k]: f[k] === o ? null : o })}
          className="capitalize">{o}</Button>
      ))}
    </div>
  );
  const active = f.category || f.season || f.style;
  return (
    <div className="space-y-2">
      {showCategory && row("category", CATEGORIES)}
      {active && <Button variant="link" size="sm" onClick={() => setF(NO_FILTERS)}>Clear filters</Button>}
    </div>
  );
}
