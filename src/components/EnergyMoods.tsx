import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "./ui/button";
import { MOODS, type Mood } from "@/lib/moods";

export function EnergyMoods({ value, onChange }: { value: Mood | undefined; onChange: (mood: Mood) => void }) {
  const [burst, setBurst] = useState<{ mood: Mood; key: number }>();
  return <section className="energy-section" aria-labelledby="energy-heading">
    <div className="section-heading"><div><p className="eyebrow">A little check-in</p><h2 id="energy-heading">What's your energy level today?</h2></div></div>
    <div className="mood-grid">{MOODS.map((mood) => <div key={mood.id} className={`mood-option mood-${mood.id}`}>
      <Button variant="ghost" className="mood-button" aria-pressed={value === mood.id} onClick={() => { onChange(mood.id); setBurst({ mood: mood.id, key: Date.now() }); }}>
        <span className="mood-symbol" aria-hidden="true">{mood.emoji}</span><span className="mood-label">{mood.name}<span className="mood-caption">{mood.palette}</span></span><span className="mood-check">{value === mood.id && <Check className="h-4 w-4" />}</span>
      </Button>
      {burst?.mood === mood.id && <div key={burst.key} className="mood-confetti" aria-hidden="true" onAnimationEnd={() => setBurst(undefined)}>{Array.from({ length: 24 }, (_, i) => <i key={i} />)}</div>}
    </div>)}</div>
  </section>;
}