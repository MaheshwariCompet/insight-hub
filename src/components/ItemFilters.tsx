import { CATEGORIES, SEASONS, STYLES, seasonOf, styleOf, type Item } from "@/lib/wardrobe";

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
        <button key={o} onClick={() => setF({ ...f, [k]: f[k] === o ? null : o })}
          className={`chip capitalize ${f[k] === o ? "bg-primary text-primary-foreground" : "bg-card"}`}>{o}</button>
      ))}
    </div>
  );
  const active = f.category || f.season || f.style;
  return (
    <div className="space-y-2">
      {showCategory && row("category", CATEGORIES)}
      {row("season", SEASONS)}
      <div className="flex flex-wrap items-center gap-2">
        {row("style", STYLES)}
        {active && <button onClick={() => setF(NO_FILTERS)} className="text-xs underline">clear filters</button>}
      </div>
    </div>
  );
}
