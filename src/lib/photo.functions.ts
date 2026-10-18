import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

export const analyzePhoto = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ image: z.string().max(800_000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/) }).parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) return { result: null, error: "Photo analysis isn't configured yet. You can enter the details yourself." };
    const { inspectPhoto } = await import("./photo.server");
    const response = await inspectPhoto(getRequest(), apiKey, data.image);
    if (response.runId) setResponseHeader("X-Lovable-AIG-Run-ID", response.runId);
    return { result: response.result, error: response.error };
  });