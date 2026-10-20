import lilacImg from "@/assets/items/lilac.jpg";
import maroonImg from "@/assets/items/maroon.jpg";
import teeImg from "@/assets/items/tee.jpg";
import satinImg from "@/assets/items/satin.jpg";
import blackImg from "@/assets/items/black.jpg";
import beigeImg from "@/assets/items/beige.jpg";
import navyImg from "@/assets/items/navy.jpg";
import meshImg from "@/assets/items/mesh.jpg";
import goldImg from "@/assets/items/gold.jpg";
import shadesImg from "@/assets/items/shades.jpg";
export type Category = "top" | "bottom" | "shoes" | "outerwear" | "accessory";
export type Season = "Summer" | "Monsoon" | "Winter" | "All-season";
export type Style = "Casual" | "Formal" | "Sporty";
export const CATEGORIES: Category[] = ["top", "bottom", "shoes", "outerwear", "accessory"];
export const SEASONS: Season[] = ["Summer", "Monsoon", "Winter", "All-season"];
export const STYLES: Style[] = ["Casual", "Formal", "Sporty"];
export type Quest = "Deep Focus" | "Standup / Demo" | "Hackathon" | "Pitch" | "Casual";
export type Commute = "crowded" | "walking" | "car" | "bike";

export interface Item {
  id: string;
  name: string;
  category: Category;
  color: string;
  heat: number; // 0-10
  rainPenalty: number;
  wrinkles: boolean;
  rainSafe: boolean;
  crowdSafe: boolean;
  layer: boolean;
  formal?: number; // 0-2
  season?: Season;
  style?: Style;
  image?: string;
  fabric?: string;
  addedAt?: string;
  price?: number | undefined;
  careStatus?: "ready" | "laundry" | "dry-cleaning";
}

export function seasonOf(i: Item): Season {
  return i.season ?? "All-season";
}
export function styleOf(i: Item): Style {
  return i.style ?? ((i.formal ?? 1) >= 2 ? "Formal" : "Casual");
}

export interface WearEntry {
  date: string; // YYYY-MM-DD
  top: string;
  bottom: string;
  shoes: string;
}

export interface Settings {
  quest: Quest;
  zeroIron: boolean;
  commute: Commute;
  coldAC: boolean;
}

export interface Place { name: string; latitude: number; longitude: number }
export interface Profile { name: string; work: string }
export const FABRICS = ["Not sure", "Cotton", "Linen", "Polyester", "Denim", "Wool", "Silk", "Blend"] as const;
export function fabricProperties(fabric: string) {
  const heat = ({ Cotton: 9, Linen: 10, Polyester: 6, Denim: 5, Wool: 3, Silk: 7, Blend: 7 } as Record<string, number>)[fabric] ?? 7;
  return { heat, wrinkles: ["Linen", "Cotton", "Silk"].includes(fabric), rainSafe: fabric === "Polyester", rainPenalty: fabric === "Polyester" ? 0 : 0.15 };
}
export function outfitKey(c: { top: Item; bottom: Item; shoes?: Item | undefined }) { return [c.top.id, c.bottom.id, c.shoes?.id ?? ""].join("|"); }

export interface DayWeather {
  date: string;
  high: number;
  low: number;
  rain: number;
}

export const QUESTS: Quest[] = ["Deep Focus", "Standup / Demo", "Hackathon", "Pitch", "Casual"];

export const QUEST_TIPS: Record<Quest, string> = {
  "Deep Focus": "Soft, breathable layers. Nothing that itches or needs adjusting.",
  "Standup / Demo": "One clean statement color on top — you'll be on camera.",
  Hackathon: "Max comfort, pockets, shoes you can pace in for hours.",
  Pitch: "Structured shirt, darker bottom. Keep accessories minimal.",
  Casual: "Have fun with color. Comfort first.",
};

export const SAMPLE_WARDROBE: Item[] = [
  { id: "lilac", season: "Summer", style: "Formal", name: "Lilac shirt", category: "top", color: "#c8a2e8", heat: 8, rainPenalty: 0, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false, formal: 2 },
  { id: "maroon", season: "All-season", style: "Formal", name: "Maroon shirt", category: "top", color: "#7a1f3d", heat: 6, rainPenalty: 0, wrinkles: false, rainSafe: true, crowdSafe: true, layer: true, formal: 2 },
  { id: "tee", season: "Summer", style: "Casual", name: "White “Sunshine” tee", category: "top", color: "#fbfaf3", heat: 10, rainPenalty: 0.1, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false, formal: 0 },
  { id: "satin", season: "All-season", style: "Formal", name: "Blush satin shirt", category: "top", color: "#f4c2c2", heat: 5, rainPenalty: 0.15, wrinkles: true, rainSafe: false, crowdSafe: true, layer: false, formal: 2 },
  { id: "black", season: "All-season", style: "Formal", name: "Black trousers", category: "bottom", color: "#1d1d1f", heat: 5, rainPenalty: 0, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false, formal: 2 },
  { id: "beige", season: "Summer", style: "Casual", name: "Beige pants", category: "bottom", color: "#d9c4a0", heat: 7, rainPenalty: 0.35, wrinkles: false, rainSafe: false, crowdSafe: true, layer: false, formal: 1 },
  { id: "navy", season: "Monsoon", style: "Casual", name: "Navy wide-leg", category: "bottom", color: "#1f2f5c", heat: 8, rainPenalty: 0.1, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false, formal: 1 },
  { id: "mesh", season: "Summer", style: "Sporty", name: "Pink-white mesh sneakers", category: "shoes", color: "#f7b6cf", heat: 8, rainPenalty: 0, wrinkles: false, rainSafe: false, crowdSafe: true, layer: false, formal: 0 },
  { id: "gold", season: "All-season", style: "Formal", name: "Gold jewelry", category: "accessory", color: "#d4a937", heat: 10, rainPenalty: 0, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false },
  { id: "shades", season: "Summer", style: "Casual", name: "Mirrored sunglasses", category: "accessory", color: "#8fb8d8", heat: 10, rainPenalty: 0, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false },
];

export const SAMPLE_IMAGES: Record<string, string> = { lilac: lilacImg, maroon: maroonImg, tee: teeImg, satin: satinImg, black: blackImg, beige: beigeImg, navy: navyImg, mesh: meshImg, gold: goldImg, shades: shadesImg };

export const GAP_CANDIDATES: Item[] = [
  { id: "gap-sneaker", name: "Black rubber-sole sneakers", category: "shoes", color: "#222", heat: 7, rainPenalty: 0, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false, formal: 1 },
  { id: "gap-chino", name: "Olive cotton chinos", category: "bottom", color: "#6b7b3a", heat: 8, rainPenalty: 0.05, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false, formal: 1 },
  { id: "gap-overshirt", name: "Light denim overshirt", category: "top", color: "#7da0c9", heat: 7, rainPenalty: 0, wrinkles: false, rainSafe: true, crowdSafe: true, layer: true, formal: 1 },
  { id: "gap-tee", name: "Sage quick-dry tee", category: "top", color: "#a8c3a0", heat: 10, rainPenalty: 0, wrinkles: false, rainSafe: true, crowdSafe: true, layer: false, formal: 0 },
];

export const SAMPLE_WEEK: DayWeather[] = [
  { date: "", high: 35, low: 27, rain: 26 },
  { date: "", high: 34, low: 26, rain: 55 },
  { date: "", high: 37, low: 28, rain: 10 },
  { date: "", high: 33, low: 26, rain: 70 },
  { date: "", high: 36, low: 27, rain: 20 },
].map((d, i) => ({ ...d, date: addDays(today(), i) }));

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function addDays(date: string, n: number) {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export interface ScoreResult {
  top: Item;
  bottom: Item;
  shoes?: Item | undefined;
  layer?: Item | undefined;
  layerKind: "suitable" | "light" | "none";
  heat: number;
  rainReady: number;
  base: number;
  ac: number;
  variety: number;
  quest: number;
  score: number;
  rainRisk: boolean;
  reasons: string[];
}

export function eligible(items: Item[], s: Settings) {
  return items.filter((i) => {
    if (i.careStatus && i.careStatus !== "ready") return false;
    if (s.zeroIron && i.wrinkles) return false;
    if (s.commute === "crowded" && !i.crowdSafe) return false;
    return true;
  });
}

function pickLayer(items: Item[], top: Item, s: Settings) {
  const layers = items.filter((i) => (i.layer || i.category === "outerwear") && i.id !== top.id);
  if (!layers.length) return { layer: undefined, kind: "none" as const };
  const best = [...layers].sort((a, b) => a.heat - b.heat)[0];
  if (!best) return { layer: undefined, kind: "none" as const };
  return { layer: best, kind: best.heat <= 7 ? ("suitable" as const) : ("light" as const) };
}

export function scoreOutfit(
  top: Item,
  bottom: Item,
  shoes: Item | undefined,
  all: Item[],
  w: DayWeather,
  s: Settings,
  history: WearEntry[],
  on: string = today(),
): ScoreResult {
  const shoeHeat = shoes ? shoes.heat : 5;
  let heat = ((top.heat + bottom.heat + shoeHeat) / 3) * 10;
  if (w.high >= 37) heat -= 5;
  const rainReady = 100 - w.rain * (0.6 + top.rainPenalty + bottom.rainPenalty);
  const wt = 0.2 + (0.7 * w.rain) / 100;
  const base = heat * (1 - wt) + rainReady * wt;
  const { layer, kind } = pickLayer(all, top, s);
  const ac = kind === "suitable" ? 100 : kind === "light" ? 65 : 30;
  let overall = s.coldAC ? 0.8 * base + 0.2 * ac : base;

  // variety
  let variety = 0;
  const recent = history.filter((h) => {
    const d = daysBetween(h.date, on);
    return d >= 0 && d <= 14;
  });
  const pieces = [top.id, bottom.id, shoes?.id].filter(Boolean) as string[];
  for (const p of pieces) {
    const last7 = recent.some((h) => daysBetween(h.date, on) <= 7 && [h.top, h.bottom, h.shoes].includes(p));
    if (last7) variety -= 4;
    const any14 = recent.some((h) => [h.top, h.bottom, h.shoes].includes(p));
    if (!any14 && history.length) variety += 2;
  }
  if (recent.some((h) => h.top === top.id && h.bottom === bottom.id)) variety -= 30;
  overall += variety;

  // side quest dress code
  let quest = 0;
  const formal = ((top.formal ?? 1) + (bottom.formal ?? 1)) / 2;
  if (s.quest === "Pitch") quest = formal >= 1.5 ? 5 : formal < 1 ? -8 : 0;
  if (s.quest === "Standup / Demo") quest = formal >= 1 ? 3 : -3;
  if (s.quest === "Hackathon" || s.quest === "Deep Focus") quest = formal <= 1 ? 3 : -2;
  overall += quest;

  const rainRisk = w.rain >= 40 && (!top.rainSafe || !bottom.rainSafe || (shoes ? !shoes.rainSafe : false));
  if (rainRisk) overall -= 40;

  const score = Math.max(0, Math.min(100, Math.round(overall)));

  const reasons: string[] = [];
  if (heat >= 80) reasons.push(`Breathable combo — great for ${w.high}°C.`);
  else if (heat < 65) reasons.push(`A bit warm for ${w.high}°C; you'll feel the heat.`);
  if (w.rain >= 40) reasons.push(rainRisk ? "Rain risk: some pieces hate water." : "Every piece survives a downpour.");
  else if (rainReady >= 75) reasons.push(`Holds up fine at ${w.rain}% rain chance.`);
  if (s.coldAC) reasons.push(layer ? `Throw on the ${layer.name.toLowerCase()} for the AC.` : "No layer for the cold AC — you may shiver.");
  if (variety < 0) reasons.push("You've worn some of this recently.");
  if (variety > 0) reasons.push("Fresh pieces you haven't worn lately.");
  if (quest > 0) reasons.push(`Fits the ${s.quest} vibe.`);
  if (quest < 0) reasons.push(`Not ideal for ${s.quest}.`);
  if (s.commute === "crowded") reasons.push("Commute-proof: snag-free and wipe-clean.");

  return { top, bottom, shoes, layer, layerKind: kind, heat, rainReady, base, ac, variety, quest, score, rainRisk, reasons };
}

export function rankCombos(items: Item[], w: DayWeather, s: Settings, history: WearEntry[], on?: string) {
  const ok = eligible(items, s);
  const tops = ok.filter((i) => i.category === "top");
  const bottoms = ok.filter((i) => i.category === "bottom");
  const shoes = ok.filter((i) => i.category === "shoes");
  const out: ScoreResult[] = [];
  for (const t of tops)
    for (const b of bottoms) {
      const opts = shoes.length ? shoes : [undefined];
      const best = opts
        .map((sh) => scoreOutfit(t, b, sh, ok, w, s, history, on))
        .sort((x, y) => y.score - x.score)[0];
      if (best) out.push(best);
    }
  return out.sort((a, b) => b.score - a.score);
}

export function scoreColor(n: number) {
  return n >= 70 ? "good" : n >= 55 ? "ok" : "bad";
}

export function planWeek(items: Item[], week: DayWeather[], s: Settings, history: WearEntry[]) {
  const sim = [...history];
  return week.map((d) => {
    const best = rankCombos(items, d, s, sim, d.date)[0];
    if (best) sim.push({ date: d.date, top: best.top.id, bottom: best.bottom.id, shoes: best.shoes?.id ?? "" });
    return { day: d, pick: best };
  });
}
