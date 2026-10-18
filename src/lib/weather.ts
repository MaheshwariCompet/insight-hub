import { useQuery } from "@tanstack/react-query";
import { useStore } from "./store";
import type { DayWeather, Place } from "./wardrobe";

export async function fetchWeather(place: Place, signal?: AbortSignal): Promise<DayWeather[]> {
  const params = new URLSearchParams({ latitude: String(place.latitude), longitude: String(place.longitude), daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max", forecast_days: "7", timezone: "auto" });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: signal ?? null });
  if (!response.ok) throw new Error("Weather is unavailable. Please try again.");
  const { daily } = await response.json();
  if (!Array.isArray(daily?.time)) throw new Error("Weather is unavailable. Please try again.");
  return daily.time.map((date: string, i: number) => ({ date, high: Math.round(daily.temperature_2m_max[i]), low: Math.round(daily.temperature_2m_min[i]), rain: daily.precipitation_probability_max[i] ?? 0 }));
}
export function useWeather() {
  const { location } = useStore();
  return useQuery({ queryKey: ["weather", location.latitude, location.longitude], queryFn: ({ signal }) => fetchWeather(location, signal), staleTime: 600_000, retry: 1 });
}