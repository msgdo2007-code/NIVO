import { BarChart3, CircleUserRound, Coins, Compass, Headphones, LayoutDashboard, Link2, Orbit, Package, Palette, Settings, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";

const items = [[LayoutDashboard, "Visão geral"], [CircleUserRound, "Meu perfil"], [Sparkles, "Editor"], [Link2, "Links"], [Palette, "Aparência"], [Headphones, "Músicas"], [BarChart3, "Analytics"], [Trophy, "Progressão"], [Coins, "Carteira"], [ShoppingBag, "Mercado NIVO"], [Package, "Inventário"], [Compass, "Afiliados"], [Settings, "Configurações"]] as const;

export function Sidebar() {
  return <aside className="sidebar"><Link className="brand" href="/"><span className="brand-mark"><Orbit /></span><strong>NIVO</strong></Link><nav aria-label="Dashboard">{items.map(([Icon, label], index) => <span className={index === 0 ? "active" : "disabled"} key={label}><Icon />{label}{index > 0 && <small>em breve</small>}</span>)}</nav></aside>;
}
