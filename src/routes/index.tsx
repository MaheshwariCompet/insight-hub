import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { ItemThumb } from "@/components/AddItemDialog";
import { ItemFilters, NO_FILTERS, applyFilters } from "@/components/ItemFilters";
import { Header } from "@/components/Header";
import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES, GAP_CANDIDATES, QUESTS, QUEST_TIPS, SAMPLE_WEEK, addDays, rankCombos, scoreColor, today,
  type Commute, type DayWeather, type Item, type ScoreResult, type Settings, type WearEntry,
} from "@/lib/wardrobe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aadai Nanban Dashboard — Today's Outfit" },
      { name: "description", content: "Pick a weather-aware outfit from your own wardrobe in under 10 seconds." },
      { property: "og:title", content: "Aadai Nanban Dashboard — Today's Outfit" },
      { property: "og:description", content: "Weather-aware, no-iron, commute-proof outfit picks from your closet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const toneBg = { good: "bg-good", ok: "bg-ok", bad: "bg-bad" } as const;

function Dashboard() {
  const { items, history, settings, setHistory, setSettings, logOutfit } = useStore();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [week, setWeek] = useState<DayWeather[]>(SAMPLE_WEEK);
  const [live, setLive] = useState(false);
  const [rainOverride, setRainOverride] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=13.08&longitude=80.27&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=Asia%2FKolkata")
      .then((r) => r.json())
      .then((j) => {
        const d = j.daily;
        if (!d?.time) return;
        setWeek(d.time.map((t: string, i: number) => ({
          date: t, high: Math.round(d.temperature_2m_max[i]), low: Math.round(d.temperature_2m_min[i]), rain: d.precipitation_probability_max[i] ?? 0,
        })));
        setLive(true);
      })
      .catch(() => {});
  }, []);

  const base0: DayWeather = week[0] ?? SAMPLE_WEEK[0]!;
  const todayW: DayWeather = { ...base0, rain: rainOverride ?? base0.rain };
  const combos = useMemo(() => rankCombos(items, todayW, settings, history), [items, todayW.rain, todayW.high, settings, history]);
  const pick = combos.find((c) => key(c) === selected) ?? combos[0];
  const filtered = applyFilters(items, filters);
  const goodCount = combos.filter((c) => c.score >= 70).length;
  const tops = items.filter((i) => i.category === "top").length;
  const bottoms = items.filter((i) => i.category === "bottom").length;

  const gap = useMemo(() => {
    return GAP_CANDIDATES.filter((g) => !items.some((i) => i.id === g.id))
      .map((g) => ({ g, gain: rankCombos([...items, g], todayW, settings, history).filter((c) => c.score >= 70).length - goodCount }))
      .sort((a, b) => b.gain - a.gain)[0];
  }, [items, todayW.rain, settings, history, goodCount]);

  function wear(c: ScoreResult) {
    logOutfit({ date: today(), top: c.top.id, bottom: c.bottom.id, shoes: c.shoes?.id ?? "" });
    toast.success("Logged today's outfit");
    setSelected(null);
  }
  function surprise() {
    if (!combos.length || !pick) return;
    const fresh = combos.filter((c) => c.score >= 55 && key(c) !== key(pick));
    const pool = fresh.length ? fresh : combos;
    setSelected(key(pool[Math.floor(Math.random() * pool.length)]!));
  }
  const set = (p: Partial<Settings>) => setSettings({ ...settings, ...p });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <Header />

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {/* Weather */}
        <div className="fit-card p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase">Chennai · today</span>
            <span className={`chip ${live ? "bg-secondary" : "bg-muted"}`}>{live ? "live" : "sample"}</span>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-6xl font-extrabold">{todayW.high}°</span>
            <span className="pb-2 text-muted-foreground">/ {todayW.low}°</span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm font-semibold">
              <span>What-if rain</span>
              <span className="font-mono">{todayW.rain}%</span>
            </div>
            <input type="range" min={0} max={100} value={todayW.rain} onChange={(e) => setRainOverride(+e.target.value)} className="mt-2 w-full" />
            {rainOverride !== null && (
              <button onClick={() => setRainOverride(null)} className="text-xs underline">reset to forecast ({todayW.rain}%)</button>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="fit-card p-5 md:col-span-2">
          <p className="font-mono text-xs uppercase">Today's side quest</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUESTS.map((q) => (
              <button key={q} onClick={() => set({ quest: q })} className={`chip ${settings.quest === q ? "bg-primary text-primary-foreground" : "bg-card"}`}>{q}</button>
            ))}
          </div>
          <p className="mt-4 font-mono text-xs uppercase">Commute</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([["crowded", "🚌 Crowded transit"], ["walking", "🚶 Walking"], ["car", "🚗 Car"], ["bike", "🛵 Bike"]] as [Commute, string][]).map(([v, l]) => (
              <button key={v} onClick={() => set({ commute: v })} className={`chip ${settings.commute === v ? "bg-secondary" : "bg-card"}`}>{l}</button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Toggle on={settings.zeroIron} onClick={() => set({ zeroIron: !settings.zeroIron })} label="Zero-Iron" />
            <Toggle on={settings.coldAC} onClick={() => set({ coldAC: !settings.coldAC })} label="Cold office AC" />
          </div>
        </div>
      </section>

      <p className="mt-6 rounded-full border-2 border-border bg-accent px-4 py-2 text-center text-sm font-bold">
        Your {items.length} pieces make {tops * bottoms} looks · {goodCount} suit today
      </p>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[["Total", items.length], ...CATEGORIES.map((c) => [c, items.filter((i) => i.category === c).length]), ["Logged", history.length]].map(([l, n]) => (
          <div key={l as string} className="fit-card p-3 text-center">
            <p className="text-3xl font-extrabold">{n}</p>
            <p className="font-mono text-xs uppercase">{l}</p>
          </div>
        ))}
      </section>

      <section className="fit-card mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-extrabold">Browse by tag <span className="font-mono text-sm">({filtered.length})</span></h3>
          <Link to="/wardrobe" className="text-sm font-semibold underline">Open full wardrobe →</Link>
        </div>
        <div className="mt-3"><ItemFilters f={filters} setF={setFilters} /></div>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {filtered.map((i) => (
            <div key={i.id} className="w-28 shrink-0 text-center">
              <ItemThumb item={i} size="h-24 w-28" />
              <p className="mt-1 truncate text-xs font-semibold">{i.name}</p>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No pieces match.</p>}
        </div>
      </section>

      {(
        <section className="mt-5 grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {pick ? (
              <OutfitPanel c={pick} w={todayW} settings={settings} items={items} onWear={() => wear(pick)} onSurprise={surprise} />
            ) : (
              <div className="fit-card p-6">Add at least one top and one bottom to get outfits.</div>
            )}
          </div>
          <div className="space-y-5 lg:col-span-2">
            <div className="fit-card p-5">
              <h3 className="text-lg font-extrabold">Combo grid</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {combos.map((c) => (
                  <button key={key(c)} onClick={() => setSelected(key(c))}
                    className={`rounded-xl border-2 border-border p-2 text-left transition hover:-translate-y-0.5 ${pick && key(c) === key(pick) ? "ring-4 ring-ring" : ""}`}>
                    <div className="flex gap-1">
                      <ItemThumb item={c.top} size="h-10 w-10" /><ItemThumb item={c.bottom} size="h-10 w-10" />
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold">{c.top.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.bottom.name}</p>
                    <span className={`mt-1 inline-block rounded-full border-2 border-border px-2 font-mono text-xs font-bold ${toneBg[scoreColor(c.score)]}`}>{c.score}</span>
                  </button>
                ))}
              </div>
            </div>
            {gap && gap.gain > 0 && (
              <div className="fit-card bg-secondary p-5">
                <p className="font-mono text-xs uppercase">Shop the gap</p>
                <div className="mt-2 flex items-center gap-3">
                  <ItemThumb item={gap.g} size="h-14 w-14" />
                  <div>
                    <p className="font-bold">{gap.g.name}</p>
                    <p className="text-sm">Unlocks +{gap.gain} great looks today</p>
                  </div>
                </div>
                <button onClick={() => setCart([...cart, gap.g.id])} disabled={cart.includes(gap.g.id)} className="btn-pop mt-3 bg-card px-4 py-1.5 text-sm disabled:opacity-60">
                  {cart.includes(gap.g.id) ? "In cart ✓" : "Add to cart"}
                </button>
                {cart.length > 0 && <p className="mt-2 text-xs">🛒 {cart.length} item(s) in cart</p>}
              </div>
            )}
            <History history={history} items={items} onClear={() => setHistory([])} />
          </div>
        </section>
      )}

    </div>
  );
}

const key = (c: ScoreResult) => `${c.top.id}|${c.bottom.id}`;

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 font-semibold">
      <span className={`relative h-7 w-12 rounded-full border-2 border-border transition ${on ? "bg-good" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full border-2 border-border bg-card transition-all ${on ? "left-5" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

function Meter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold"><span>{label}</span><span className="font-mono">{Math.round(value)}</span></div>
      <div className="mt-1 h-4 overflow-hidden rounded-full border-2 border-border bg-muted">
        <div className={`h-full ${tone} transition-all`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function OutfitPanel({ c, w, settings, items, onWear, onSurprise }: { c: ScoreResult; w: DayWeather; settings: Settings; items: Item[]; onWear: () => void; onSurprise: () => void }) {
  const accessories = items.filter((i) => i.category === "accessory");
  const wetOrCrowded = w.rain >= 40 || settings.commute === "crowded";
  return (
    <div className="fit-card overflow-hidden">
      <div className="flex items-center justify-between border-b-2 border-border bg-accent px-5 py-3">
        <span className="font-mono text-sm font-bold uppercase">✦ Today's pick ✦</span>
        <span className={`rounded-full border-2 border-border px-3 py-0.5 font-mono text-lg font-bold ${toneBg[scoreColor(c.score)]}`}>{c.score}/100</span>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <div className="space-y-2">
          {[["Top", c.top], ["Bottom", c.bottom], ["Shoes", c.shoes], ["Layer", settings.coldAC ? c.layer : undefined]].map(([l, it]) =>
            it ? (
              <div key={l as string} className="flex items-center gap-3 rounded-xl border-2 border-border bg-card p-2">
                <ItemThumb item={it as Item} size="h-14 w-14" />
                <div><p className="font-mono text-[10px] uppercase text-muted-foreground">{l as string}</p><p className="font-bold leading-tight">{(it as Item).name}</p></div>
              </div>
            ) : null,
          )}
          {accessories.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">{accessories.map((a) => <span key={a.id} className="chip bg-muted">{a.name}</span>)}</div>
          )}
        </div>
        <div className="space-y-3">
          <Meter label="🔥 Heat comfort" value={c.heat} tone="bg-sun" />
          <Meter label="☔ Rain ready" value={c.rainReady} tone="bg-rain" />
          {settings.coldAC && <Meter label="❄️ AC layer" value={c.ac} tone="bg-secondary" />}
          <div className="rounded-xl border-2 border-dashed border-border p-3 text-sm">
            <p className="font-bold">Why this fit?</p>
            <ul className="mt-1 list-disc pl-4">{c.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            {wetOrCrowded && <p className="mt-1">👖 Cuff long hems today.</p>}
          </div>
          <p className="text-sm"><b>{settings.quest}:</b> {QUEST_TIPS[settings.quest]}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 border-t-2 border-border px-5 py-4">
        <button onClick={onWear} className="btn-pop bg-primary px-5 py-2 text-primary-foreground">I wore this ✓</button>
        <button onClick={onSurprise} className="btn-pop bg-secondary px-5 py-2">Surprise me 🎲</button>
      </div>
    </div>
  );
}

function History({ history, items, onClear }: { history: WearEntry[]; items: Item[]; onClear: () => void }) {
  const name = (id: string) => items.find((i) => i.id === id)?.name ?? "—";
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  return (
    <div className="fit-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold">Wear history</h3>
        {history.length > 0 && <button onClick={onClear} className="text-xs underline">clear</button>}
      </div>
      {sorted.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Tap “I wore this” to start tracking.</p> : (
        <ul className="mt-2 space-y-1 text-sm">
          {sorted.map((h) => <li key={h.date}><span className="font-mono text-xs">{h.date}</span> · {name(h.top)} + {name(h.bottom)}</li>)}
        </ul>
      )}
      <p className="mt-2 text-xs text-muted-foreground">Yesterday: {addDays(today(), -1)}</p>
    </div>
  );
}
