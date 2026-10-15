import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { CATEGORIES, SEASONS, STYLES, type Category, type Season, type Style } from "@/lib/wardrobe";

const schema = z.object({
  name: z.string().trim().min(1, "Give the item a name").max(60, "Keep the name under 60 characters"),
  image: z.union([z.literal(""), z.string().url("Enter a valid image link").max(2000), z.string().startsWith("data:image/")]),
});

const HEAT: Record<Season, number> = { Summer: 9, Monsoon: 7, Winter: 4, "All-season": 7 };
const FORMAL: Record<Style, number> = { Casual: 0, Sporty: 0, Formal: 2 };

export function AddItemDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { addItem } = useStore();
  const [open, setOpen] = useState(false);
  const blank = { name: "", category: "top" as Category, color: "#f28b82", season: "All-season" as Season, style: "Casual" as Style, image: "", rainSafe: true, wrinkles: false };
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<string | null>(null);

  function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErr("Pick an image file");
    if (file.size > 1_000_000) return setErr("Image must be under 1 MB");
    const r = new FileReader();
    r.onload = () => setF((p) => ({ ...p, image: String(r.result) }));
    r.readAsDataURL(file);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const res = schema.safeParse(f);
    if (!res.success) return setErr(res.error.issues[0]!.message);
    addItem({
      id: crypto.randomUUID(),
      name: res.data.name,
      category: f.category,
      color: f.color,
      season: f.season,
      style: f.style,
      image: res.data.image || undefined,
      heat: HEAT[f.season],
      rainPenalty: f.rainSafe ? 0 : 0.2,
      rainSafe: f.rainSafe,
      wrinkles: f.wrinkles,
      crowdSafe: true,
      layer: f.category === "outerwear",
      formal: FORMAL[f.style],
    });
    toast.success(`${res.data.name} added to your wardrobe`);
    setF(blank);
    setErr(null);
    setOpen(false);
  }

  const pill = (on: boolean) => `chip capitalize ${on ? "bg-primary text-primary-foreground" : "bg-card"}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <button className="btn-pop bg-primary px-4 py-2 text-primary-foreground">+ Add item</button>}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-2 border-border">
        <DialogHeader><DialogTitle className="text-2xl font-extrabold">Add a piece</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm font-semibold">Item name
            <input autoFocus value={f.name} maxLength={60} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Mint cotton kurta" className="mt-1 w-full rounded-xl border-2 border-border bg-card px-3 py-2" />
          </label>
          <div><p className="text-sm font-semibold">Category</p>
            <div className="mt-1 flex flex-wrap gap-2">{CATEGORIES.map((c) => <button type="button" key={c} onClick={() => setF({ ...f, category: c })} className={pill(f.category === c)}>{c}</button>)}</div>
          </div>
          <div><p className="text-sm font-semibold">Season</p>
            <div className="mt-1 flex flex-wrap gap-2">{SEASONS.map((c) => <button type="button" key={c} onClick={() => setF({ ...f, season: c })} className={pill(f.season === c)}>{c}</button>)}</div>
          </div>
          <div><p className="text-sm font-semibold">Style</p>
            <div className="mt-1 flex flex-wrap gap-2">{STYLES.map((c) => <button type="button" key={c} onClick={() => setF({ ...f, style: c })} className={pill(f.style === c)}>{c}</button>)}</div>
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold">Color
            <input type="color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} className="h-9 w-14 rounded border-2 border-border" />
          </label>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Image link (optional)
              <input value={f.image.startsWith("data:") ? "" : f.image} onChange={(e) => setF({ ...f, image: e.target.value.trim() })} placeholder="https://…" className="mt-1 w-full rounded-xl border-2 border-border bg-card px-3 py-2" />
            </label>
            <label className="block text-sm font-semibold">…or upload a photo
              <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-1 block w-full text-sm" />
            </label>
            {f.image && <img src={f.image} alt="Preview" className="h-24 w-24 rounded-xl border-2 border-border object-cover" />}
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.rainSafe} onChange={(e) => setF({ ...f, rainSafe: e.target.checked })} /> Fine in rain</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.wrinkles} onChange={(e) => setF({ ...f, wrinkles: e.target.checked })} /> Wrinkles easily</label>
          </div>
          {err && <p className="text-sm font-semibold text-destructive">{err}</p>}
          <button type="submit" className="btn-pop w-full bg-primary py-2 text-primary-foreground">Save to wardrobe</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ItemThumb({ item, size = "h-10 w-10" }: { item: { color: string; image?: string; name: string }; size?: string }) {
  return item.image ? (
    <img src={item.image} alt={item.name} className={`${size} shrink-0 rounded-md border-2 border-border object-cover`} />
  ) : (
    <span className={`${size} inline-block shrink-0 rounded-md border-2 border-border`} style={{ background: item.color }} />
  );
}
