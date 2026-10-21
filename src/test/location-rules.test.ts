import { afterEach, expect, it, vi } from "vitest";
import { resolveLocation } from "../lib/location";
afterEach(() => vi.unstubAllGlobals());
it("shows Chennai rather than My location for resolved device coordinates", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [{ properties: { city: "Chennai", state: "Tamil Nadu", country: "India" } }] }) }));
  expect(await resolveLocation(13.08, 80.27)).toEqual({ latitude: 13.08, longitude: 80.27, name: "Chennai, Tamil Nadu, India" });
});
it("preserves real coordinates without inventing a city when lookup fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  expect(await resolveLocation(13.08, 80.27)).toEqual({ latitude: 13.08, longitude: 80.27, name: "13.080°, 80.270°" });
});