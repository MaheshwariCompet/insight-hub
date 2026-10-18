import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";
import { AddItemDialog } from "@/components/AddItemDialog";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
const links = [{ to: "/", label: "Today", exact: true }, { to: "/wardrobe", label: "My Wardrobe" }, { to: "/planner", label: "Outfit Planner" }, { to: "/analytics", label: "Insights" }] as const;
export function Header() {
  return <header className="border-b border-border pb-5"><div className="flex flex-wrap items-center justify-between gap-4"><Link to="/" className="flex min-w-0 items-center gap-3"><img src={logo} alt="Aadai Nanban logo" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" /><span className="min-w-0"><span className="block font-display text-xl font-semibold">Aadai Nanban <span className="inline-block text-xs font-normal text-muted-foreground">ஆடை நண்பன்</span></span><span className="block text-xs text-muted-foreground">Your dress friend, every morning</span></span></Link><div className="flex items-center gap-2"><Button asChild variant="ghost" size="icon"><Link to="/profile" aria-label="My Profile" title="My Profile"><UserRound /></Link></Button><AddItemDialog /></div></div><nav className="mt-5 flex flex-wrap gap-x-7 gap-y-3 text-sm">{links.map((l) => <Link key={l.to} to={l.to} className="nav-link" activeProps={{ className: "nav-link text-primary" }} activeOptions={{ exact: "exact" in l }}>{l.label}</Link>)}</nav></header>;
}
