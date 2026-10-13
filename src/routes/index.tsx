import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useEffect, useMemo, useState } from "react";
import {
  GAP_CANDIDATES, QUESTS, QUEST_TIPS, SAMPLE_WARDROBE, SAMPLE_WEEK, addDays, planWeek, rankCombos, scoreColor, today,
  type Category, type Commute, type DayWeather, type Item, type ScoreResult, type Settings, type WearEntry,
} from "@/lib/wardrobe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FitCheck Dashboard — Today's Outfit" },
      { name: "description", content: "Pick a weather-aware outfit from your own wardrobe in under 10 seconds." },
      { property: "og:title", content: "FitCheck Dashboard — Today's Outfit" },
      { property: "og:description", content: "Weather-aware, no-iron, commute-proof outfit picks from your closet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setV(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(v));
  }, [key, v, ready]);
  return [v, setV] as const;
}

const toneBg = { good: "bg-good", ok: "bg-ok", bad: "bg-bad" } as const;

function Dashboard() {
  const [items, setItems] = useLocal<Item[]>("fc-wardrobe", SAMPLE_WARDROBE);
  const [history, setHistory] = useLocal<WearEntry[]>("fc-history", []);
  const [settings, setSettings] = useLocal<Settings>("fc-settings", { quest: "Casual", zeroIron: false, commute: "car", coldAC: false });
  const [week, setWeek] = useState<DayWeather[]>(SAMPLE_WEEK);
  const [live, setLive] = useState(false);
  const [rainOverride, setRainOverride] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [tab, setTab] = useState<"today" | "week" | "closet">("today");

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

  const todayW = { ...week[0], rain: rainOverride ?? week[0].rain };
  const combos = useMemo(() => rankCombos(items, todayW, settings, history), [items, todayW.rain, todayW.high, settings, history]);
  const pick = combos.find((c) => key(c) === selected) ?? combos[0];
  const plan = useMemo(() => planWeek(items, week, settings, history), [items, week, settings, history]);
  const goodCount = combos.filter((c) => c.score >= 70).length;
  const tops = items.filter((i) => i.category === "top").length;
  const bottoms = items.filter((i) => i.category === "bottom").length;

  const gap = useMemo(() => {
    return GAP_CANDIDATES.filter((g) => !items.some((i) => i.id === g.id))
      .map((g) => ({ g, gain: rankCombos([...items, g], todayW, settings, history).filter((c) => c.score >= 70).length - goodCount }))
      .sort((a, b) => b.gain - a.gain)[0];
  }, [items, todayW.rain, settings, history, goodCount]);

  function wear(c: ScoreResult) {
    setHistory([...history.filter((h) => h.date !== today()), { date: today(), top: c.top.id, bottom: c.bottom.id, shoes: c.shoes?.id ?? "" }]);
    setSelected(null);
  }
  function surprise() {
    const fresh = combos.filter((c) => c.score >= 55 && key(c) !== key(pick));
    const pool = fresh.length ? fresh : combos;
    setSelected(key(pool[Math.floor(Math.random() * pool.length)]));
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
              <button onClick={() => setRainOverride(null)} className="text-xs underline">reset to forecast ({week[0].rain}%)</button>
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

      <nav className="mt-6 flex gap-2">
        {(["today", "week", "closet"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`btn-pop px-4 py-2 capitalize ${tab === t ? "bg-ink text-background" : "bg-card"}`}>{t === "week" ? "Weekly plan" : t === "closet" ? "My closet" : "Today"}</button>
        ))}
      </nav>

      {tab === "today" && (
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
                    className={`rounded-xl border-2 border-border p-2 text-left transition hover:-translate-y-0.5 ${key(c) === key(pick) ? "ring-4 ring-ring" : ""}`}>
                    <div className="flex gap-1">
                      <Swatch color={c.top.color} /><Swatch color={c.bottom.color} />
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
                  <Swatch color={gap.g.color} big />
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

      {tab === "week" && (
        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {plan.map(({ day, pick: p }, i) => (
            <div key={day.date} className="fit-card p-4">
              <p className="font-mono text-xs uppercase">{i === 0 ? "Today" : new Date(day.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}</p>
              <p className="text-2xl font-extrabold">{day.high}° <span className="text-sm font-normal">☔ {day.rain}%</span></p>
              {p ? (
                <>
                  <div className="mt-3 flex gap-1"><Swatch color={p.top.color} big /><Swatch color={p.bottom.color} big />{p.shoes && <Swatch color={p.shoes.color} big />}</div>
                  <p className="mt-2 text-sm font-semibold">{p.top.name}</p>
                  <p className="text-sm text-muted-foreground">{p.bottom.name}</p>
                  <span className={`mt-2 inline-block rounded-full border-2 border-border px-2 font-mono text-xs font-bold ${toneBg[scoreColor(p.score)]}`}>{p.score}</span>
                </>
              ) : <p className="mt-2 text-sm">No combos</p>}
            </div>
          ))}
        </section>
      )}

      {tab === "closet" && <Closet items={items} setItems={setItems} />}
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

function Swatch({ color, big }: { color: string; big?: boolean }) {
  return <span className={`inline-block rounded-md border-2 border-border ${big ? "h-10 w-10" : "h-6 w-6"}`} style={{ background: color }} />;
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
        <span className="font-mono text-sm font-bold uppercase">✦ Fit check ✦</span>
        <span className={`rounded-full border-2 border-border px-3 py-0.5 font-mono text-lg font-bold ${toneBg[scoreColor(c.score)]}`}>{c.score}/100</span>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <div className="space-y-2">
          {[["Top", c.top], ["Bottom", c.bottom], ["Shoes", c.shoes], ["Layer", settings.coldAC ? c.layer : undefined]].map(([l, it]) =>
            it ? (
              <div key={l as string} className="flex items-center gap-3 rounded-xl border-2 border-border bg-card p-2">
                <Swatch color={(it as Item).color} big />
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

function Closet({ items, setItems }: { items: Item[]; setItems: (i: Item[]) => void }) {
  const blank = { name: "", category: "top" as Category, color: "#f28b82", heat: 7, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false };
  const [f, setF] = useState(blank);
  function add() {
    if (!f.name.trim()) return;
    setItems([...items, { ...f, id: crypto.randomUUID(), rainPenalty: f.rainSafe ? 0 : 0.2, formal: 1 }]);
    setF(blank);
  }
  return (
    <section className="mt-5 grid gap-5 lg:grid-cols-3">
      <div className="fit-card space-y-3 p-5">
        <h3 className="text-lg font-extrabold">Add a piece</h3>
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Mint cotton kurta" className="w-full rounded-xl border-2 border-border bg-card px-3 py-2" />
        <div className="flex flex-wrap gap-2">
          {(["top", "bottom", "shoes", "accessory"] as Category[]).map((c) => (
            <button key={c} onClick={() => setF({ ...f, category: c })} className={`chip capitalize ${f.category === c ? "bg-primary text-primary-foreground" : "bg-card"}`}>{c}</button>
          ))}
        </div>
        <label className="flex items-center gap-3 font-semibold">Color <input type="color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} className="h-9 w-14 rounded border-2 border-border" /></label>
        <label className="block font-semibold">Heat score: <span className="font-mono">{f.heat}</span>
          <input type="range" min={0} max={10} value={f.heat} onChange={(e) => setF({ ...f, heat: +e.target.value })} className="w-full" />
        </label>
        <div className="flex flex-wrap gap-3 text-sm">
          <Toggle on={f.wrinkles} onClick={() => setF({ ...f, wrinkles: !f.wrinkles })} label="Wrinkles easily" />
          <Toggle on={f.rainSafe} onClick={() => setF({ ...f, rainSafe: !f.rainSafe })} label="Fine in rain" />
          <Toggle on={f.crowdSafe} onClick={() => setF({ ...f, crowdSafe: !f.crowdSafe })} label="Crowd safe" />
          <Toggle on={f.layer} onClick={() => setF({ ...f, layer: !f.layer })} label="Wear open as layer" />
        </div>
        <button onClick={add} className="btn-pop w-full bg-primary py-2 text-primary-foreground">Add to closet</button>
        <button onClick={() => setItems(SAMPLE_WARDROBE)} className="w-full text-xs underline">Reset to sample wardrobe</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
        {items.map((i) => (
          <div key={i.id} className="fit-card flex items-start gap-3 p-3">
            <Swatch color={i.color} big />
            <div className="flex-1">
              <p className="font-bold leading-tight">{i.name}</p>
              <p className="font-mono text-xs uppercase text-muted-foreground">{i.category} · heat {i.heat}</p>
              <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                {i.wrinkles && <span className="chip bg-ok">wrinkles</span>}
                {!i.rainSafe && <span className="chip bg-rain">not rain-safe</span>}
                {!i.crowdSafe && <span className="chip bg-bad">fragile</span>}
                {i.layer && <span className="chip bg-secondary">layer</span>}
              </div>
            </div>
            <button onClick={() => setItems(items.filter((x) => x.id !== i.id))} aria-label={`Remove ${i.name}`} className="text-lg">✕</button>
          </div>
        ))}
      </div>
    </section>
  );
}
