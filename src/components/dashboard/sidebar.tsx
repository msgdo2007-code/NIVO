import { BarChart3, CircleUserRound, Coins, Compass, Headphones, LayoutDashboard, Link2, Orbit, Package, Palette, Settings, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";

const items = [
  { icon: LayoutDashboard, label: "Visão geral", href: "/dashboard" },
  { icon: CircleUserRound, label: "Meu perfil", href: "/dashboard/perfil" },
  { icon: Sparkles, label: "Editor", href: "/dashboard/editor" },
  { icon: Link2, label: "Links", href: "/dashboard/editor" },
  { icon: Palette, label: "Aparência", href: "/dashboard/perfil" },
  { icon: Headphones, label: "Músicas", href: null },
  { icon: BarChart3, label: "Analytics", href: null },
  { icon: Trophy, label: "Progressão", href: null },
  { icon: Coins, label: "Carteira", href: null },
  { icon: ShoppingBag, label: "Mercado NIVO", href: null },
  { icon: Package, label: "Inventário", href: null },
  { icon: Compass, label: "Afiliados", href: null },
  { icon: Settings, label: "Configurações", href: null },
] as const;

export function Sidebar() {
  return <aside className="sidebar"><Link className="brand" href="/"><span className="brand-mark"><Orbit /></span><strong>NIVO</strong></Link><nav aria-label="Dashboard">{items.map(({ icon: Icon, label, href }, index) => href ? <Link className={index === 0 ? "active" : ""} href={href} key={label}><Icon />{label}</Link> : <span className="disabled" key={label}><Icon />{label}<small>em breve</small></span>)}</nav></aside>;
}
