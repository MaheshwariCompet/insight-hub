import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shuffle, Check, CalendarPlus, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { WeatherBar } from "@/components/WeatherBar";
import { OutfitCard } from "@/components/OutfitCard";
import { ItemThumb } from "@/components/AddItemDialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useWeather } from "@/lib/weather";
import { rankCombos, outfitKey, today, type Item } from "@/lib/wardrobe";

export const Route = createFileRoute("/planner")({
  validateSearch: (search: Record<string, unknown>): { outfit?: string; date?: string } => ({ ...(typeof search.outfit === "string" ? { outfit: search.outfit } : {}), ...(typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date) && Number.isFinite(Date.parse(search.date)) ? { date: search.date } : {}) }),
  head: () => ({ meta: [{ title: "Outfit Planner — Aadai Nanban" }, { name: "description", content: "Choose outfits, save upcoming plans and record what you wore." }, { property: "og:title", content: "Outfit Planner — Aadai Nanban" }, { property: "og:description", content: "Plan with your own clothes and local weather, and keep a daily wear history." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Planner,
});
type Outfit = { top?: Item; bottom?: Item; shoes?: Item };
function Planner() {
  const search = Route.useSearch();
  const { items, history, plans, settings, logOutfit, setHistory, savePlan, removePlan, favorites, toggleFavorite } = useStore();
  const weather = useWeather();
  const [date, setDate] = useState(search.date ?? today()), [outfit, setOutfit] = useState<Outfit>({}), [mode, setMode] = useState("weather");
  const forecast = weather.data?.find((d) => d.date === date) ?? weather.data?.[0];
  const combos = forecast ? rankCombos(items, forecast, settings, history, date) : [];
  useEffect(() => {
    const date = search.date ?? today(); setDate(date);
    const saved = [...history, ...plans].find((p) => p.date === date);
    const ids = search.outfit?.split("|") ?? (saved ? [saved.top, saved.bottom, saved.shoes] : []);
    if (ids.length) setOutfit({ top: items.find((i) => i.id === ids[0]), bottom: items.find((i) => i.id === ids[1]), shoes: items.find((i) => i.id === ids[2]) });
  }, [search.date, search.outfit, items]);
  const selectDate = (value: string) => { setDate(value); const saved = [...history, ...plans].find((p) => p.date === value); if (saved) setOutfit({ top: items.find((i) => i.id === saved.top), bottom: items.find((i) => i.id === saved.bottom), shoes: items.find((i) => i.id === saved.shoes) }); };
  function generate() {
    if (mode === "random") { const pick = (c: Item["category"]) => { const pool = items.filter((i) => i.category === c); return pool[Math.floor(Math.random() * pool.length)]; }; setOutfit({ top: pick("top"), bottom: pick("bottom"), shoes: pick("shoes") }); return; }
    const next = combos.find((c) => c.top.id !== outfit.top?.id || c.bottom.id !== outfit.bottom?.id) ?? combos[0];
    if (next) setOutfit({ top: next.top, bottom: next.bottom, shoes: next.shoes }); else toast.error("Add a top and bottom, and check the forecast first.");
  }
  function save() {
    if (!outfit.top || !outfit.bottom) return toast.error("Choose a top and a bottom first.");
    const entry = { date, top: outfit.top.id, bottom: outfit.bottom.id, shoes: outfit.shoes?.id ?? "" };
    if (date > today()) { savePlan(entry); toast.success(`Outfit planned for ${date}`); } else { logOutfit(entry); removePlan(date); toast.success(`Outfit recorded for ${date}`); }
  }
  const selectedKey = outfit.top && outfit.bottom ? outfitKey({ top: outfit.top, bottom: outfit.bottom, shoes: outfit.shoes }) : null;
  return <main className="page-shell"><Header /><WeatherBar /><section className="page-intro"><p className="eyebrow">Choose. Plan. Wear.</p><h1>Outfit Planner</h1></section>
    <section className="grid gap-10 lg:grid-cols-[1.3fr_1fr]"><div><div className="flex flex-wrap items-center gap-3"><Button onClick={generate} disabled={mode === "weather" && !forecast}><Shuffle />Generate outfit</Button><select aria-label="Outfit suggestion mode" value={mode} onChange={(e) => setMode(e.target.value)}><option value="weather">For local weather</option><option value="random">Any combination</option></select></div><div className="mt-6 grid gap-5 grid-cols-3">{([['Top', 'top'], ['Bottom', 'bottom'], ['Shoes', 'shoes']] as const).map(([label, category]) => { const item = outfit[category]; return <div key={category} className="min-w-0"><p className="eyebrow mb-2">{label}</p>{item ? <ItemThumb item={item} size="h-52 w-full !border-0" /> : <div className="flex h-52 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">Not selected</div>}<select aria-label={`Choose ${label.toLowerCase()}`} value={item?.id ?? ""} onChange={(e) => setOutfit({ ...outfit, [category]: items.find((i) => i.id === e.target.value) })} className="mt-3 w-full min-w-0 text-xs"><option value="">Choose {label.toLowerCase()}</option>{items.filter((i) => i.category === category).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>; })}</div><div className="mt-6 flex flex-wrap items-center gap-3"><label className="text-sm">Date <input aria-label="Outfit date" type="date" value={date} onChange={(e) => selectDate(e.target.value || today())} className="ml-2" /></label><Button onClick={save}>{date > today() ? <CalendarPlus /> : <Check />}{date > today() ? "Save plan" : "I wore this"}</Button>{selectedKey && <Button variant="outline" size="icon" title="Favorite this outfit" aria-label="Favorite selected outfit" aria-pressed={favorites.includes(selectedKey)} onClick={() => toggleFavorite(selectedKey)}><Heart className={favorites.includes(selectedKey) ? "fill-primary text-primary" : ""} /></Button>}</div>{forecast && <p className="mt-4 text-xs text-muted-foreground">{date === forecast.date ? `${forecast.high}°C · ${forecast.rain}% rain chance` : `Using today's forecast; weather for ${date} is unavailable.`} · Comfort is estimated, not guaranteed.</p>}</div>
    <div><h2>Wear history</h2><div className="mt-4 space-y-4">{!history.length && <p className="text-sm text-muted-foreground">No outfits recorded yet.</p>}{[...history].sort((a, b) => b.date.localeCompare(a.date)).map((h) => <div key={h.date} className="flex items-center gap-3 border-b border-border pb-3"><div className="flex gap-1">{[h.top, h.bottom, h.shoes].map((id) => { const i = items.find((i) => i.id === id); return i ? <ItemThumb key={id} item={i} /> : null; })}</div><Button variant="link" onClick={() => selectDate(h.date)}>{h.date}</Button><Button className="ml-auto" variant="ghost" size="icon" title="Delete wear record" aria-label={`Delete ${h.date}`} onClick={() => setHistory(history.filter((x) => x.date !== h.date))}><Trash2 /></Button></div>)}</div><h2 className="mt-8">Saved plans</h2>{!plans.length && <p className="mt-4 text-sm text-muted-foreground">No outfits planned yet.</p>}{[...plans].sort((a, b) => a.date.localeCompare(b.date)).map((p) => <div className="mt-3 flex items-center border-b border-border pb-2" key={p.date}><Button variant="link" onClick={() => selectDate(p.date)}>{p.date} · {items.find((i) => i.id === p.top)?.name ?? "Removed piece"}</Button><Button size="icon" variant="ghost" title="Remove plan" aria-label={`Remove plan ${p.date}`} onClick={() => removePlan(p.date)}><Trash2 /></Button></div>)}</div></section>
    <section className="mt-12"><h2>Choose a combination</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{combos.slice(0, 9).map((c) => <OutfitCard key={outfitKey(c)} outfit={c} choose={() => setOutfit({ top: c.top, bottom: c.bottom, shoes: c.shoes })} />)}</div></section>
  </main>;
}
