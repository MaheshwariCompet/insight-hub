import { rankCombos, type Item, type WearEntry, type DayWeather, type Settings } from "./wardrobe";

export const OCCASIONS = ["Everyday", "Work meeting", "Casual weekend", "Active day"];
export function occasionSettings(settings: Settings, occasion: string): Settings {
  return { ...settings, quest: occasion === "Work meeting" ? "Pitch" : occasion === "Active day" ? "Hackathon" : "Casual" };
}
export function dailyOutfit(items: Item[], history: WearEntry[], plans: WearEntry[], weather: DayWeather | undefined, settings: Settings, date: string) {
  const resolve = (entry: WearEntry | undefined) => {
    if (!entry) return undefined;
    const top = items.find((i) => i.id === entry.top), bottom = items.find((i) => i.id === entry.bottom), shoes = items.find((i) => i.id === entry.shoes);
    if (!top || !bottom || (entry.shoes && !shoes)) return undefined;
    if ([top, bottom, shoes].some((i) => i?.careStatus && i.careStatus !== "ready")) return undefined;
    return { top, bottom, shoes };
  };
  const recorded = resolve(history.find((e) => e.date === date));
  if (recorded) return { ...recorded, source: "recorded" as const, reasons: [] as string[] };
  const saved = resolve(plans.find((e) => e.date === date));
  if (saved) return { ...saved, source: "planned" as const, reasons: [] as string[] };
  const best = weather ? rankCombos(items, weather, settings, history, date)[0] : undefined;
  return best ? { ...best, source: "suggested" as const } : undefined;
}
export function wardrobeHighlights(items: Item[], history: WearEntry[], date: string) {
  const wears = items.map((item) => {
    const entries = history.filter((h) => h.date <= date && [h.top, h.bottom, h.shoes].includes(item.id));
    const last = entries.map((e) => e.date).sort().at(-1);
    const since = last ?? item.addedAt?.slice(0, 10);
    const days = since ? Math.floor((Date.parse(date) - Date.parse(since)) / 86400000) : undefined;
    return { item, count: entries.length, last, orphan: days !== undefined && days >= 90, cpw: entries.length && item.price !== undefined && item.price > 0 ? item.price / entries.length : undefined };
  });
  return {
    mostLoved: wears.filter((w) => w.count > 0).sort((a, b) => b.count - a.count)[0],
    orphans: wears.filter((w) => w.orphan),
    champion: wears.filter((w) => w.cpw !== undefined).sort((a, b) => (a.cpw ?? Infinity) - (b.cpw ?? Infinity))[0],
    unavailable: items.filter((i) => i.careStatus && i.careStatus !== "ready"),
    recent: items.filter((i) => i.addedAt).sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? "")).slice(0, 8),
  };
}