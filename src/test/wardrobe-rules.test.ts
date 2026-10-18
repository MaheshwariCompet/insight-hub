import { describe, expect, it } from "vitest";
import { fabricProperties, outfitKey, SAMPLE_WARDROBE } from "@/lib/wardrobe";
import { fetchWeather } from "@/lib/weather";
import { vi } from "vitest";
describe("wardrobe recommendations", () => {
  it("uses entered fabric instead of asking for a season", () => {
    expect(fabricProperties("Linen").heat).toBe(10);
    expect(fabricProperties("Wool").heat).toBe(3);
  });
  it("identifies favorites by the full top, bottom and shoe combination", () => {
    const top = SAMPLE_WARDROBE.find((i) => i.id === "lilac");
    const bottom = SAMPLE_WARDROBE.find((i) => i.id === "black");
    const shoes = SAMPLE_WARDROBE.find((i) => i.id === "mesh");
    if (!top || !bottom || !shoes) throw new Error("Missing test pieces");
    expect(outfitKey({ top, bottom, shoes })).toBe("lilac|black|mesh");
    expect(outfitKey({ top, bottom })).toBe("lilac|black|");
  });
  it("fetches seven days for the chosen location, not Chennai", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ daily: { time: ["2026-10-18"], temperature_2m_max: [22], temperature_2m_min: [17], precipitation_probability_max: [65] } }) });
    vi.stubGlobal("fetch", fetchMock);
    try {
      expect(await fetchWeather({ name: "London", latitude: 51.5, longitude: -0.12 })).toEqual([{ date: "2026-10-18", high: 22, low: 17, rain: 65 }]);
      const url = new URL(fetchMock.mock.calls[0]?.[0]);
      expect(url.searchParams.get("latitude")).toBe("51.5");
      expect(url.searchParams.get("longitude")).toBe("-0.12");
      expect(url.searchParams.get("forecast_days")).toBe("7");
    } finally { vi.unstubAllGlobals(); }
  });
  it("does not show invented weather when the live service fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    try { await expect(fetchWeather({ name: "London", latitude: 51.5, longitude: -0.12 })).rejects.toThrow("Weather is unavailable"); }
    finally { vi.unstubAllGlobals(); }
  });
});
