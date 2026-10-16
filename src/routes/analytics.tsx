import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Aadai Nanban Analytics — Why Mornings Go Wrong" },
      { name: "description", content: "Insights from 110,000 simulated mornings: mismatch causes, planners vs non-planners, rain and shoes." },
      { property: "og:title", content: "Aadai Nanban Analytics — Why Mornings Go Wrong" },
      { property: "og:description", content: "Mismatch causes, planner impact and repetition from 110,000 simulated mornings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analytics,
});

const causes = [
  { name: "Dress code mismatch", v: 9.2 },
  { name: "Fabric unsuited to heat", v: 7.4 },
  { name: "Rain not factored in", v: 6.8 },
  { name: "No layer for cold AC", v: 6.0 },
];

const compare = [
  { label: "Decision time (min)", planner: 3.5, none: 14.7, max: 15 },
  { label: "Mismatch rate (%)", planner: 5.3, none: 40, max: 40 },
  { label: "Late to work (%)", planner: 2.0, none: 21.2, max: 25 },
];

function Analytics() {
  const [hover, setHover] = useState<number | null>(null);
  const total = causes.reduce((a, c) => a + c.v, 0);
  let cum = 0;
  const pts = causes.map((c, i) => {
    cum += c.v;
    return { x: i * 100 + 50, y: 200 - (cum / total) * 180 };
  });
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <Header />
      <h1 className="mt-8 text-4xl font-extrabold md:text-5xl">110,000 mornings, <span className="text-primary">30% went wrong.</span></h1>
      <p className="mt-2 text-muted-foreground">Simulated dataset · heuristic, not scientific.</p>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="fit-card p-5">
          <h2 className="text-xl font-extrabold">Pareto of mismatch causes</h2>
          <p className="text-sm text-muted-foreground">% of all mornings · line = cumulative share</p>
          <svg viewBox="0 0 400 230" className="mt-4 w-full">
            {causes.map((c, i) => {
              const h = (c.v / 10) * 180;
              return (
                <g key={c.name} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={i * 100 + 15} y={200 - h} width={70} height={h} rx={6} className={hover === i ? "fill-primary" : "fill-accent"} stroke="currentColor" strokeWidth={2.5} />
                  <text x={i * 100 + 50} y={192 - h} textAnchor="middle" className="fill-foreground font-mono text-[13px] font-bold">{c.v}%</text>
                </g>
              );
            })}
            <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="currentColor" strokeWidth={2.5} strokeDasharray="5 4" />
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} className="fill-secondary" stroke="currentColor" strokeWidth={2} />)}
            <line x1={0} x2={400} y1={200} y2={200} stroke="currentColor" strokeWidth={2.5} />
          </svg>
          <div className="mt-2 grid grid-cols-4 gap-1 text-center text-xs font-semibold">
            {causes.map((c) => <span key={c.name}>{c.name}</span>)}
          </div>
        </div>

        <div className="fit-card p-5">
          <h2 className="text-xl font-extrabold">Planners vs no-planners</h2>
          <div className="mt-4 space-y-5">
            {compare.map((r) => (
              <div key={r.label}>
                <p className="font-semibold">{r.label}</p>
                {[["Planner", r.planner, "bg-good"], ["No plan", r.none, "bg-bad"]].map(([l, v, t]) => (
                  <div key={l as string} className="mt-1 flex items-center gap-2">
                    <span className="w-16 font-mono text-xs">{l}</span>
                    <div className="h-5 flex-1 overflow-hidden rounded-full border-2 border-border bg-muted">
                      <div className={`h-full ${t}`} style={{ width: `${((v as number) / r.max) * 100}%` }} />
                    </div>
                    <span className="w-12 text-right font-mono text-sm font-bold">{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="fit-card p-5">
          <h2 className="text-xl font-extrabold">The repetition trap</h2>
          <div className="mt-4 flex items-end gap-6">
            <Stat big="78.7%" label="of days planners repeated an outfit" tone="bg-ok" />
            <Stat big="21.4%" label="for non-planners" tone="bg-muted" />
          </div>
          <p className="mt-4 text-sm">Planners' top 3 outfits covered <b>~72%</b> of days — why Aadai Nanban tracks wear history and has a <b>Surprise me</b> button.</p>
        </div>

        <div className="fit-card p-5">
          <h2 className="text-xl font-extrabold">Rain & shoes</h2>
          <div className="mt-4 flex items-end gap-6">
            <Stat big="35%" label="wore non-rain-ready shoes on rain days" tone="bg-rain" />
            <Stat big="22.5%" label="of them got wet feet" tone="bg-bad" />
          </div>
          <p className="mt-4 text-sm">On 40%+ rain days, Aadai Nanban ranks unsafe shoes last.</p>
        </div>
      </section>
    </div>
  );
}

function Stat({ big, label, tone }: { big: string; label: string; tone: string }) {
  return (
    <div className="flex-1">
      <span className={`inline-block rounded-xl border-2 border-border px-3 py-1 text-3xl font-extrabold ${tone}`}>{big}</span>
      <p className="mt-2 text-sm">{label}</p>
    </div>
  );
}
