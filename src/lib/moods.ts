import type { Item } from "./wardrobe";

export const MOODS = [
  { id: "minimalist", name: "Effortless Minimalist", emoji: "◒", palette: "Quiet neutrals" },
  { id: "bold", name: "Bold & Edgy", emoji: "✦", palette: "Rich color & contrast" },
  { id: "comfort", name: "Ultimate Comfort", emoji: "☁", palette: "Soft, easy tones" },
] as const;
export type Mood = typeof MOODS[number]["id"];

const NAMED_COLORS: Record<string, string> = { black: "1d1d1f", white: "ffffff", grey: "808080", gray: "808080", beige: "d9c4a0", cream: "fffdd0", red: "ff0000", maroon: "7a1f3d", burgundy: "800020", blue: "0000ff", navy: "1f2f5c", pink: "f4c2c2", lilac: "c8a2e8", green: "008000", yellow: "ffff00", purple: "800080", orange: "ff8000" };
export function moodAffinity(item: Item, mood: Mood): number {
  let hex = NAMED_COLORS[item.color.toLowerCase().trim()] ?? item.color.replace(/^#/, "");
  if (/^[\da-f]{3}$/i.test(hex)) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[\da-f]{6}$/i.test(hex)) return 0;
  const rgb = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(...rgb), min = Math.min(...rgb);
  const chroma = max - min, light = (max + min) / 2;
  if (mood === "minimalist") return (1 - chroma) * 20;
  if (mood === "bold") return Math.max(chroma, 1 - light) * 20;
  return (light * (1 - chroma * 0.5)) * 16 + (["Cotton", "Linen", "Blend"].includes(item.fabric ?? "") ? 4 : 0);
}