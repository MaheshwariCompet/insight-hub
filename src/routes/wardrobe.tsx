import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { AddItemDialog, ItemThumb } from "@/components/AddItemDialog";
import { ItemFilters, NO_FILTERS, applyFilters } from "@/components/ItemFilters";
import { useStore } from "@/lib/store";
import { SAMPLE_WARDROBE, seasonOf, styleOf } from "@/lib/wardrobe";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

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
    <div className="page-shell">
      <Header />
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <h1>My Wardrobe <span className="text-lg text-muted-foreground">{shown.length}/{items.length}</span></h1>
        <input aria-label="Search pieces" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pieces…" />
      </div>
      <div className="mt-6 border-y border-border py-4"><ItemFilters f={f} setF={setF} /></div>
      {items.some((i) => SAMPLE_WARDROBE.some((s) => s.id === i.id)) && <p className="mt-3 text-xs text-muted-foreground">Sample pieces are included. Replace them with photos of your own clothes.</p>}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((i) => (
          <div key={i.id} className="fit-card flex flex-col overflow-hidden">
            <ItemThumb item={i} size="h-60 w-full !rounded-none !border-0" />
            <div className="flex flex-1 flex-col p-3">
              <p className="font-bold leading-tight">{i.name}</p>
              <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                <span className="chip bg-accent capitalize">{i.category}</span>
                <span className="chip bg-muted">{i.fabric ?? "Fabric not recorded"}</span>
              </div>
              <Button title={`Remove ${i.name}`} aria-label={`Remove ${i.name}`} variant="ghost" size="icon" onClick={() => { removeItem(i.id); toast(`${i.name} removed`); }} className="mt-3 self-end"><Trash2 /></Button>
            </div>
          </div>
        ))}
        <AddItemDialog trigger={
          <Button variant="outline" className="flex h-auto min-h-64 flex-col gap-3 border-dashed"><Plus className="!h-7 !w-7" />Add clothes</Button>
        } />
      </section>
      {shown.length === 0 && <p className="mt-4 text-muted-foreground">Nothing matches these filters.</p>}
      <Button variant="link" size="sm" onClick={() => { if (window.confirm("Replace your wardrobe with the sample pieces? Your uploaded pieces will be removed.")) setItems(SAMPLE_WARDROBE); }} className="mt-6">Reset to sample wardrobe</Button>
    </div>
  );
}
