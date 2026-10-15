import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { ItemThumb } from "@/components/AddItemDialog";
import { useStore } from "@/lib/store";
import { SAMPLE_WEEK, planWeek, rankCombos, today, type Item } from "@/lib/wardrobe";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Outfit Planner — FitCheck" },
      { name: "description", content: "Generate outfits from your closet, log what you wore and plan the week." },
      { property: "og:title", content: "Outfit Planner — FitCheck" },
      { property: "og:description", content: "Generate, log and plan outfits from your own wardrobe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planner,
});

type Outfit = { top?: Item | undefined; bottom?: Item | undefined; shoes?: Item | undefined };
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function Planner() {
  const { items, history, settings, logOutfit, setHistory } = useStore();
  const [mode, setMode] = useState<"smart" | "random">("smart");
  const [o, setO] = useState<Outfit>({});
  const [date, setDate] = useState(today());
  const by = (c: Item["category"]) => items.filter((i) => i.category === c);
  const plan = useMemo(() => planWeek(items, SAMPLE_WEEK, settings, history), [items, settings, history]);

  function generate() {
    if (mode === "random") return setO({ top: rand(by("top")), bottom: rand(by("bottom")), shoes: rand(by("shoes")) });
    const top5 = rankCombos(items, SAMPLE_WEEK[0]!, settings, history).slice(0, 5);
    const c = rand(top5);
    setO(c ? { top: c.top, bottom: c.bottom, shoes: c.shoes } : {});
  }
  function log() {
    if (!o.top || !o.bottom) return toast.error("Pick at least a top and a bottom");
    logOutfit({ date, top: o.top.id, bottom: o.bottom.id, shoes: o.shoes?.id ?? "" });
    toast.success(`Outfit logged for ${date}`);
  }
  const name = (id: string) => items.find((i) => i.id === id)?.name ?? "removed item";
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));

  const slot = (label: string, k: keyof Outfit, cat: Item["category"]) => (
    <div className="rounded-xl border-2 border-border bg-card p-3">
      <p className="font-mono text-[10px] uppercase text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-3">
        {o[k] ? <ItemThumb item={o[k]!} size="h-12 w-12" /> : <span className="h-12 w-12 rounded-md border-2 border-dashed border-border" />}
        <select value={o[k]?.id ?? ""} onChange={(e) => setO({ ...o, [k]: items.find((i) => i.id === e.target.value) })} className="flex-1 rounded-lg border-2 border-border bg-card px-2 py-1 font-semibold">
          <option value="">— none —</option>
          {by(cat).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <Header />
      <h1 className="mt-8 text-4xl font-extrabold">Outfit Planner</h1>
      <section className="mt-5 grid gap-5 lg:grid-cols-5">
        <div className="fit-card space-y-3 p-5 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={generate} className="btn-pop bg-primary px-5 py-2 text-primary-foreground">Generate outfit 🎲</button>
            {(["smart", "random"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`chip ${mode === m ? "bg-secondary" : "bg-card"}`}>{m === "smart" ? "Weather-smart" : "Fully random"}</button>
            ))}
          </div>
          {slot("Top", "top", "top")}
          {slot("Bottom", "bottom", "bottom")}
          {slot("Shoes", "shoes", "shoes")}
          <div className="flex flex-wrap items-center gap-3 border-t-2 border-border pt-3">
            <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value || today())} className="rounded-lg border-2 border-border bg-card px-2 py-1" />
            <button onClick={log} className="btn-pop bg-accent px-5 py-2">Log daily outfit ✓</button>
          </div>
        </div>
        <div className="fit-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">History log <span className="font-mono text-sm">({history.length})</span></h2>
            {history.length > 0 && <button onClick={() => setHistory([])} className="text-xs underline">clear all</button>}
          </div>
          {sorted.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No outfits logged yet.</p> : (
            <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto text-sm">
              {sorted.map((h) => (
                <li key={h.date} className="flex items-start justify-between gap-2 rounded-lg border-2 border-border p-2">
                  <div><p className="font-mono text-xs">{h.date}</p><p>{name(h.top)} + {name(h.bottom)}{h.shoes && ` + ${name(h.shoes)}`}</p></div>
                  <button aria-label={`Delete ${h.date}`} onClick={() => setHistory(history.filter((x) => x.date !== h.date))}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <h2 className="mt-10 text-2xl font-extrabold">This week's plan</h2>
      <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {plan.map(({ day, pick: p }, i) => (
          <div key={day.date} className="fit-card p-4">
            <p className="font-mono text-xs uppercase">{i === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}</p>
            <p className="text-2xl font-extrabold">{day.high}° <span className="text-sm font-normal">☔ {day.rain}%</span></p>
            {p ? (
              <>
                <div className="mt-3 flex gap-1"><ItemThumb item={p.top} /><ItemThumb item={p.bottom} />{p.shoes && <ItemThumb item={p.shoes} />}</div>
                <p className="mt-2 text-sm font-semibold">{p.top.name}</p>
                <p className="text-sm text-muted-foreground">{p.bottom.name}</p>
              </>
            ) : <p className="mt-2 text-sm">No combos</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
