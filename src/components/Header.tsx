import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <Link to="/" className="text-2xl font-extrabold tracking-tight">fit<span className="text-primary">check</span>✦</Link>
      <div className="flex gap-2">
        <Link to="/" className="chip bg-card" activeProps={{ className: "chip bg-accent" }} activeOptions={{ exact: true }}>Dashboard</Link>
        <Link to="/analytics" className="chip bg-card" activeProps={{ className: "chip bg-accent" }}>Analytics</Link>
      </div>
    </header>
  );
}

