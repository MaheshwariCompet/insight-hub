import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { WeatherBar } from "@/components/WeatherBar";
import { OutfitCard } from "@/components/OutfitCard";
import { ItemThumb } from "@/components/AddItemDialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useWeather } from "@/lib/weather";
import { addDays, rankCombos, planWeek, today } from "@/lib/wardrobe";

export const Route = createFileRoute("/")({ head: () => ({ meta: [
  { title: "Everyday Outfits — Aadai Nanban" }, { name: "description", content: "See local weather, outfit combinations and your upcoming wardrobe plans." },
  { property: "og:title", content: "Everyday Outfits — Aadai Nanban" }, { property: "og:description", content: "Your own clothes, local weather and a week of everyday outfits." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
]}), component: Overview });

function Overview() {
  const { items, history, settings, profile, plans } = useStore();
  const weather = useWeather();
  const combos = weather.data?.[0] ? rankCombos(items, weather.data[0], settings, history) : [];
  const suggested = planWeek(items, weather.data ?? [], settings, history);
  const missed = Array.from({ length: 7 }, (_, i) => addDays(today(), -i - 1)).filter((date) => !history.some((h) => h.date === date));
  const recent = [...history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return <main className="page-shell"><Header /><WeatherBar />
    <section className="page-intro"><p className="eyebrow">Your everyday wardrobe</p><h1>{profile.name ? `Hello, ${profile.name}.` : "Aadai Nanban"}</h1><p className="text-muted-foreground">A little less deciding. A little more you.</p></section>
    <section className="flex flex-wrap gap-8 border-y border-border py-5"><div><span className="stat-number">{items.length}</span><span className="ml-2 text-sm text-muted-foreground">pieces in your wardrobe</span></div><div><span className="stat-number">{history.length}</span><span className="ml-2 text-sm text-muted-foreground">days recorded</span></div><div><span className="stat-number">{plans.filter((p) => p.date >= today()).length}</span><span className="ml-2 text-sm text-muted-foreground">outfits planned</span></div></section>
    <section className="mt-9"><div className="section-heading"><div><p className="eyebrow">From your own collection</p><h2>Outfit ideas for today</h2></div><Button asChild variant="link"><Link to="/planner">Open outfit planner →</Link></Button></div><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{combos.slice(0, 3).map((c) => <OutfitCard key={`${c.top.id}|${c.bottom.id}`} outfit={c} />)}</div>{!combos.length && <p className="py-8 text-muted-foreground">{weather.data ? "Add a top and a bottom to see combinations." : "Outfit ideas will appear when your local forecast is available."}</p>}</section>
    <section className="mt-12"><div className="section-heading"><div><p className="eyebrow">A calmer week ahead</p><h2>Upcoming outfits</h2></div><Button asChild variant="link"><Link to="/planner">Plan the week →</Link></Button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{suggested.slice(1, 5).map(({ day, pick }) => { const saved = plans.find((p) => p.date === day.date); const pieces = saved ? [saved.top, saved.bottom, saved.shoes].map((id) => items.find((i) => i.id === id)).filter((i) => i !== undefined) : pick ? [pick.top, pick.bottom, ...(pick.shoes ? [pick.shoes] : [])] : []; return <article key={day.date} className="fit-card p-4"><div className="flex justify-between gap-2"><span className="text-sm font-medium">{new Date(day.date + "T12:00:00").toLocaleDateString("en", { weekday: "short", day: "numeric" })}</span><span className="text-xs text-muted-foreground">{day.high}° · {day.rain}% rain</span></div><div className="mt-4 flex gap-2">{pieces.map((i) => <ItemThumb key={i.id} item={i} size="h-16 w-14" />)}</div><p className="mt-3 text-xs text-primary">{saved ? "Your saved plan" : "Suggested · not yet saved"}</p><Button asChild variant="link" className="mt-2 h-auto px-0"><Link to="/planner" search={{ date: day.date }}>Review outfit →</Link></Button></article>; })}</div></section>
    <section className="mt-12 grid gap-10 lg:grid-cols-2"><div><h2>Recently worn</h2>{!recent.length && <p className="mt-4 text-muted-foreground">No outfits recorded yet.</p>}{recent.map((h) => <div className="mt-4 flex items-center gap-3 border-b border-border pb-4" key={h.date}><div className="flex gap-1">{[h.top, h.bottom, h.shoes].map((id) => { const i = items.find((x) => x.id === id); return i ? <ItemThumb key={id} item={i} /> : null; })}</div><div><p className="text-sm font-medium">{h.date}</p><p className="text-xs text-muted-foreground">{items.find((i) => i.id === h.top)?.name ?? "Removed piece"}</p></div><Button asChild variant="link" className="ml-auto"><Link to="/planner" search={{ date: h.date }}>Edit</Link></Button></div>)}</div><div><h2>Days not recorded</h2><p className="mt-2 text-sm text-muted-foreground">{missed.length ? "Your last seven days" : "All seven days are recorded."}</p><div className="mt-4 flex flex-wrap gap-2">{missed.map((date) => <Button key={date} asChild variant="outline"><Link to="/planner" search={{ date }}>{new Date(date + "T12:00:00").toLocaleDateString("en", { weekday: "short", day: "numeric" })}</Link></Button>)}</div></div></section>
  </main>;
}
