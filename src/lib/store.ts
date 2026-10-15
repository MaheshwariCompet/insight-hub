import { useSyncExternalStore } from "react";
import { SAMPLE_WARDROBE, type Item, type Settings, type WearEntry } from "./wardrobe";

// Tiny persisted store shared by every page; survives refresh via localStorage.
interface State {
  items: Item[];
  history: WearEntry[];
  settings: Settings;
}

const DEFAULTS: State = {
  items: SAMPLE_WARDROBE,
  history: [],
  settings: { quest: "Casual", zeroIron: false, commute: "car", coldAC: false },
};
const KEYS = { items: "fc-wardrobe", history: "fc-history", settings: "fc-settings" } as const;

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
  state = next;
}

function set<K extends keyof State>(k: K, v: State[K]) {
  state = { ...state, [k]: v };
  try {
    localStorage.setItem(KEYS[k], JSON.stringify(v));
  } catch {}
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
    () => (load(), state),
    () => DEFAULTS,
  );
  return {
    ...s,
    setItems: (v: Item[]) => set("items", v),
    addItem: (i: Item) => set("items", [...state.items, i]),
    removeItem: (id: string) => set("items", state.items.filter((x) => x.id !== id)),
    setHistory: (v: WearEntry[]) => set("history", v),
    logOutfit: (e: WearEntry) => set("history", [...state.history.filter((h) => h.date !== e.date), e]),
    setSettings: (v: Settings) => set("settings", v),
  };
}
