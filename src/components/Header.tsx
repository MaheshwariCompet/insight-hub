import { Link } from "@tanstack/react-router";
import { AddItemDialog } from "@/components/AddItemDialog";

const links = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/wardrobe", label: "My Wardrobe" },
  { to: "/planner", label: "Outfit Planner" },
  { to: "/analytics", label: "Analytics" },
] as const;

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/" className="text-2xl font-extrabold tracking-tight">fit<span className="text-primary">check</span>✦</Link>
      <nav className="flex flex-wrap items-center gap-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="chip bg-card" activeProps={{ className: "chip bg-accent" }} activeOptions={{ exact: "exact" in l }}>{l.label}</Link>
        ))}
        <AddItemDialog />
      </nav>
    </header>
  );
}
