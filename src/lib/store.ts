import { useSyncExternalStore } from "react";
import { SAMPLE_WARDROBE, type Item, type Settings, type WearEntry, type Place, type Profile } from "./wardrobe";
import type { Mood } from "./moods";

// Tiny persisted store shared by every page; survives refresh via localStorage.
interface State {
  items: Item[];
  history: WearEntry[];
  settings: Settings;
  location: Place;
  profile: Profile;
  favorites: string[];
  plans: WearEntry[];
  locationChosen: boolean;
  occasions: Record<string, string>;
  energyMoods: Record<string, Mood>;
}

const DEFAULTS: State = {
  items: SAMPLE_WARDROBE,
  history: [],
  settings: { quest: "Casual", zeroIron: false, commute: "car", coldAC: false },
  location: { name: "Chennai", latitude: 13.08, longitude: 80.27 },
  profile: { name: "", work: "" },
  favorites: [],
  plans: [],
  locationChosen: false,
  occasions: {},
  energyMoods: {},
};
const KEYS = { items: "fc-wardrobe", history: "fc-history", settings: "fc-settings", location: "fc-location", profile: "fc-profile", favorites: "fc-favorites", plans: "fc-plans", locationChosen: "fc-location-chosen", occasions: "fc-occasions", energyMoods: "fc-energy-moods" } as const;

let state: State = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const next = { ...state };
  for (const k of Object.keys(KEYS) as (keyof State)[]) {
    try {
      const raw = localStorage.getItem(KEYS[k]);
      if (raw) (next as Record<string, unknown>)[k] = JSON.parse(raw);
    } catch {}
  }
  if (localStorage.getItem(KEYS.location)) next.locationChosen = true;
  state = next;
}

function set<K extends keyof State>(k: K, v: State[K]) {
  localStorage.setItem(KEYS[k], JSON.stringify(v));
  state = { ...state, [k]: v };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore() {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => DEFAULTS,
  );
  return {
    ...s,
    setItems: (v: Item[]) => set("items", v),
    addItem: (i: Item) => set("items", [...state.items, i]),
    addItems: (v: Item[]) => set("items", [...state.items, ...v]),
    removeItem: (id: string) => set("items", state.items.filter((x) => x.id !== id)),
    updateItem: (id: string, patch: Partial<Pick<Item, "price" | "careStatus">>) => set("items", state.items.map((i) => i.id === id ? { ...i, ...patch } : i)),
    setHistory: (v: WearEntry[]) => set("history", v),
    logOutfit: (e: WearEntry) => set("history", [...state.history.filter((h) => h.date !== e.date), e]),
    setSettings: (v: Settings) => set("settings", v),
    setLocation: (v: Place) => { set("location", v); set("locationChosen", true); },
    markLocationChosen: () => set("locationChosen", true),
    setOccasion: (date: string, value: string) => set("occasions", { ...state.occasions, [date]: value }),
    setEnergyMood: (date: string, value: Mood) => set("energyMoods", { ...state.energyMoods, [date]: value }),
    setProfile: (v: Profile) => set("profile", v),
    toggleFavorite: (key: string) => set("favorites", state.favorites.includes(key) ? state.favorites.filter((x) => x !== key) : [...state.favorites, key]),
    savePlan: (e: WearEntry) => set("plans", [...state.plans.filter((p) => p.date !== e.date), e]),
    removePlan: (date: string) => set("plans", state.plans.filter((p) => p.date !== date)),
  };
}
