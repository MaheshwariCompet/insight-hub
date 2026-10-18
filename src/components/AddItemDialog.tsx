import { useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Upload, Camera, X, Sparkles, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { analyzePhoto } from "@/lib/photo.functions";
import { SAMPLE_IMAGES, CATEGORIES, FABRICS, fabricProperties, type Category } from "@/lib/wardrobe";

type Draft = { id: string; name: string; category: Category; fabric: string; color: string; image: string; note: string };
function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Choose image files only."));
    if (file.size > 15_000_000) return reject(new Error("Each photo must be under 15 MB."));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
      const context = canvas.getContext("2d"); URL.revokeObjectURL(url);
      if (!context) return reject(new Error("Couldn't prepare this photo."));
      context.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't read this photo. Try a JPG or PNG.")); }; img.src = url;
  });
}
export function AddItemDialog({ trigger }: { trigger?: ReactNode }) {
  const { addItems } = useStore();
  const inspect = useServerFn(analyzePhoto);
  const [open, setOpen] = useState(false), [drafts, setDrafts] = useState<Draft[]>([]), [busy, setBusy] = useState(false), [analyzing, setAnalyzing] = useState<string | null>(null), [error, setError] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null), cameraRef = useRef<HTMLInputElement>(null);
  const update = (id: string, patch: Partial<Draft>) => setDrafts((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  async function upload(files: FileList | null) {
    if (!files?.length) return; setBusy(true); setError("");
    const next: Draft[] = [];
    for (const file of Array.from(files)) {
      try { next.push({ id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, "").slice(0, 60), category: "top", fabric: "Not sure", color: "#808080", image: await readPhoto(file), note: "" }); }
      catch (e) { setError(e instanceof Error ? e.message : "Couldn't read this photo."); }
    }
    setDrafts((rows) => [...rows, ...next]); setBusy(false);
  }
  async function analyze(draft: Draft) {
    setAnalyzing(draft.id); setError("");
    try { const response = await inspect({ data: { image: draft.image } }); if (response.result) update(draft.id, response.result); else setError(response.error ?? "Couldn't analyze this photo."); }
    catch { setError("Couldn't analyze this photo. You can still enter the details yourself."); }
    finally { setAnalyzing(null); }
  }
  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!drafts.length || drafts.some((d) => !d.name.trim())) return setError("Add a photo and a name for each piece.");
    try { addItems(drafts.map((d) => ({ id: d.id, name: d.name.trim(), category: d.category, fabric: d.fabric, color: d.color, image: d.image, ...fabricProperties(d.fabric), crowdSafe: true, layer: d.category === "outerwear", formal: 1 }))); toast.success(`${drafts.length} piece${drafts.length === 1 ? "" : "s"} added to your wardrobe`); setDrafts([]); setOpen(false); }
    catch { setError("Your browser storage is full. Remove a few photos and try again."); }
  }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>{trigger ?? <Button><Plus />Add clothes</Button>}</DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle className="text-2xl">Add to your wardrobe</DialogTitle><DialogDescription>Choose photos of your own clothes.</DialogDescription></DialogHeader>
    <input ref={uploadRef} aria-label="Upload clothing photos" type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
    <input ref={cameraRef} aria-label="Take clothing photo" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { void upload(e.target.files); e.target.value = ""; }} />
    <div className="flex flex-wrap gap-2"><Button disabled={busy || !!analyzing} variant="outline" onClick={() => uploadRef.current?.click()}><Upload />{busy ? "Preparing photos…" : "Choose photos"}</Button><Button disabled={busy || !!analyzing} variant="ghost" onClick={() => cameraRef.current?.click()}><Camera />Take a photo</Button></div><p className="text-xs text-muted-foreground">On a phone, Take a photo opens the camera when supported. On a computer, it may open the same file picker.</p>
    <form onSubmit={save} className="space-y-5">{drafts.map((d, i) => <div key={d.id} className="border-t border-border pt-4"><div className="flex items-start gap-4"><img src={d.image} alt={d.name || "Clothing photo"} className="h-28 w-24 rounded-md object-cover" /><div className="min-w-0 flex-1 space-y-3"><label className="block text-sm">Item name<input aria-label={`Item name ${i + 1}`} required maxLength={60} value={d.name} onChange={(e) => update(d.id, { name: e.target.value })} className="mt-1 w-full" /></label><div className="grid grid-cols-2 gap-3"><label className="text-sm">Category<select aria-label={`Category ${i + 1}`} value={d.category} onChange={(e) => update(d.id, { category: e.target.value as Category })} className="mt-1 w-full">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label><label className="text-sm">Cloth type<select aria-label={`Cloth type ${i + 1}`} value={d.fabric} onChange={(e) => update(d.id, { fabric: e.target.value })} className="mt-1 w-full">{FABRICS.map((f) => <option key={f}>{f}</option>)}</select></label></div><label className="flex items-center gap-3 text-sm">Color<input aria-label={`Color ${i + 1}`} type="color" value={d.color} onChange={(e) => update(d.id, { color: e.target.value })} className="h-8 w-12 p-0" /></label></div><Button type="button" size="icon" variant="ghost" aria-label={`Remove photo ${i + 1}`} onClick={() => setDrafts((rows) => rows.filter((r) => r.id !== d.id))}><X /></Button></div><Button type="button" variant="link" disabled={!!analyzing || busy} onClick={() => analyze(d)} className="mt-2 px-0"><Sparkles />{analyzing === d.id ? "Checking photo…" : "Suggest details with AI"}</Button>{d.note && <p className="text-xs text-muted-foreground">{d.note}</p>}</div>)}
    {drafts.length > 0 && <p className="text-xs text-muted-foreground">Fabric and weather guide comfort estimates. Photos cannot confirm fibers or waterproofing; check the clothing label.</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={!drafts.length || busy || !!analyzing} className="w-full">Save {drafts.length || ""} {drafts.length === 1 ? "piece" : "pieces"}</Button></form>
  </DialogContent></Dialog>;
}
export function ItemThumb({ item, size = "h-10 w-10" }: { item: { id?: string; color: string; image?: string; name: string }; size?: string }) {
  const src = item.image ?? (item.id ? SAMPLE_IMAGES[item.id] : undefined);
  const [failed, setFailed] = useState(false);
  return src && !failed ? <img src={src} alt={item.name} loading="lazy" onError={() => setFailed(true)} className={`${size} shrink-0 rounded-md border border-border object-cover`} /> : <span role="img" aria-label={`Photo unavailable: ${item.name}`} className={`${size} inline-flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground`}><ImageOff className="h-5 w-5" /></span>;
}
