import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { AddItemDialog, ItemThumb } from "@/components/AddItemDialog";
import { ItemFilters, NO_FILTERS, applyFilters } from "@/components/ItemFilters";
import { useStore } from "@/lib/store";
import { SAMPLE_WARDROBE, seasonOf, styleOf } from "@/lib/wardrobe";

export const Route = createFileRoute("/wardrobe")({
  head: () => ({
    meta: [
      { title: "My Wardrobe — Aadai Nanban" },
      { name: "description", content: "Browse, filter and add every piece in your closet." },
      { property: "og:title", content: "My Wardrobe — Aadai Nanban" },
      { property: "og:description", content: "A filterable grid of every piece in your closet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Wardrobe,
});

function Wardrobe() {
  const { items, removeItem, setItems } = useStore();
  const [f, setF] = useState(NO_FILTERS);
  const [q, setQ] = useState("");
  const shown = applyFilters(items, f).filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <Header />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl font-extrabold">My Wardrobe <span className="font-mono text-xl text-muted-foreground">{shown.length}/{items.length}</span></h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pieces…" className="rounded-full border-2 border-border bg-card px-4 py-2" />
      </div>
      <div className="fit-card mt-5 p-4"><ItemFilters f={f} setF={setF} /></div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((i) => (
          <div key={i.id} className="fit-card flex flex-col overflow-hidden">
            <ItemThumb item={i} size="h-40 w-full !rounded-none !border-0 border-b-2" />
            <div className="flex flex-1 flex-col p-3">
              <p className="font-bold leading-tight">{i.name}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                <span className="chip bg-accent capitalize">{i.category}</span>
                <span className="chip bg-secondary">{seasonOf(i)}</span>
                <span className="chip bg-muted">{styleOf(i)}</span>
              </div>
              <button onClick={() => { removeItem(i.id); toast(`${i.name} removed`); }} className="mt-auto pt-3 text-left text-xs font-semibold underline">Remove</button>
            </div>
          </div>
        ))}
        <AddItemDialog trigger={
          <button className="fit-card flex min-h-48 flex-col items-center justify-center gap-2 border-dashed p-4 text-lg font-bold">
            <span className="text-4xl">+</span>Add item
          </button>
        } />
      </section>
      {shown.length === 0 && <p className="mt-4 text-muted-foreground">Nothing matches these filters.</p>}
      <button onClick={() => setItems(SAMPLE_WARDROBE)} className="mt-6 text-xs underline">Reset to sample wardrobe</button>
    </div>
  );
}
