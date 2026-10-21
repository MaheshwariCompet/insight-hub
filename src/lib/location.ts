import type { Place } from "./wardrobe";

export async function resolveLocation(latitude: number, longitude: number, signal?: AbortSignal): Promise<Place> {
  const fallback = { latitude, longitude, name: `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°` };
  try {
    const params = new URLSearchParams({ lat: String(latitude), lon: String(longitude), lang: "en" });
    const response = await fetch(`https://photon.komoot.io/reverse?${params}`, { signal: signal ?? AbortSignal.timeout(8000) });
    if (!response.ok) return fallback;
    const data = await response.json();
    const p = data.features?.[0]?.properties;
    const city = p?.city || p?.town || p?.village || p?.district || p?.county || p?.state;
    if (typeof city !== "string" || !city.trim()) return fallback;
    const parts = [city, p?.state, p?.country].filter((v): v is string => typeof v === "string" && v.length > 0);
    return { ...fallback, name: [...new Set(parts)].join(", ") };
  } catch { return fallback; }
}