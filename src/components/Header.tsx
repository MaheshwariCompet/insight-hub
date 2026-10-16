import { Link } from "@tanstack/react-router";
import { AddItemDialog } from "@/components/AddItemDialog";
import logo from "@/assets/logo.png";

const links = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/wardrobe", label: "My Wardrobe" },
  { to: "/planner", label: "Outfit Planner" },
  { to: "/analytics", label: "Analytics" },
] as const;

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="Aadai Nanban logo" width={56} height={56} className="h-14 w-14 object-contain" />
        <span className="leading-tight">
          <span className="block text-2xl font-extrabold tracking-tight">Aadai <span className="text-primary">Nanban</span> <span className="text-base font-bold text-muted-foreground">ஆடை நண்பன்</span></span>
          <span className="block font-mono text-xs text-muted-foreground">Your dress friend, every morning</span>
        </span>
      </Link>
      <nav className="flex flex-wrap items-center gap-2">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="chip bg-card" activeProps={{ className: "chip bg-accent" }} activeOptions={{ exact: "exact" in l }}>{l.label}</Link>
        ))}
        <AddItemDialog />
      </nav>
    </header>
  );
}
