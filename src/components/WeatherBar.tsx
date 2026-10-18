import { useState } from "react";
import { MapPin, Search, CloudRain, Sun, LocateFixed } from "lucide-react";
import { Button } from "./ui/button";
import { useStore } from "@/lib/store";
import { useWeather } from "@/lib/weather";
import type { Place } from "@/lib/wardrobe";

export function WeatherBar() {
  const { location, setLocation } = useStore();
  const weather = useWeather();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function search(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setResults([]);
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`);
      if (!r.ok) throw new Error();
      const j = await r.json();
      const places = (j.results ?? []).map((p: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }) => ({ name: [p.name, p.admin1, p.country].filter(Boolean).join(", "), latitude: p.latitude, longitude: p.longitude }));
      setResults(places); if (!places.length) setError("No places found. Try a nearby town or city.");
    } catch { setError("Couldn't search locations. Check your connection and try again."); }
    finally { setBusy(false); }
  }
  function locate() {
    setBusy(true); setError("");
    if (!navigator.geolocation) { setBusy(false); setError("Location is unavailable. Search for your city instead."); return; }
    navigator.geolocation.getCurrentPosition((p) => { setLocation({ name: "My location", latitude: p.coords.latitude, longitude: p.coords.longitude }); setOpen(false); setBusy(false); }, () => { setError("Location access is unavailable. Search for your city instead."); setBusy(false); });
  }
  const day = weather.data?.[0];
  return <section className="weather-band mt-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Button variant="ghost" onClick={() => setOpen(!open)} className="h-auto max-w-full justify-start whitespace-normal px-0 text-left"><MapPin /><span>{location.name}</span><span className="text-xs text-primary">Change</span></Button>
      {day ? <div className="flex flex-wrap items-center gap-5 text-sm"><span className="flex items-center gap-2"><Sun className="h-4 w-4 text-sun" />{day.high}° / {day.low}°</span><span className="flex items-center gap-2"><CloudRain className="h-4 w-4 text-rain" />{day.rain}% rain</span><span className="text-xs text-muted-foreground">Today · Open-Meteo</span></div> : <span className="text-sm text-muted-foreground">{weather.isError ? "Weather unavailable" : "Loading forecast…"}</span>}
    </div>
    {weather.isError && <div className="mt-2 flex items-center gap-2 text-sm text-destructive">No live forecast. Outfit suggestions are paused.<Button variant="link" onClick={() => weather.refetch()}>Retry</Button></div>}
    {open && <div className="mt-4 border-t border-border pt-4"><form onSubmit={search} className="flex flex-wrap gap-2"><input aria-label="City or town" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City or town" minLength={2} maxLength={100} required className="min-w-0 flex-1" /><Button disabled={busy}><Search />Search</Button><Button type="button" variant="outline" disabled={busy} onClick={locate}><LocateFixed />Use my location</Button></form>{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}<div className="mt-2 flex flex-col items-start">{results.map((p) => <Button key={`${p.latitude},${p.longitude}`} variant="ghost" className="h-auto whitespace-normal py-2 text-left" onClick={() => { setLocation(p); setOpen(false); setResults([]); }}><MapPin />{p.name}</Button>)}</div></div>}
  </section>;
}