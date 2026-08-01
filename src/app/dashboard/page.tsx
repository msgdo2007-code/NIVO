import { ArrowUpRight, BarChart3, Eye, MousePointerClick, Orbit, Rocket, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";

const metrics = [[Eye, "Visualizações"], [UsersRound, "Visitantes únicos"], [MousePointerClick, "Cliques"], [BarChart3, "CTR"]] as const;

export default function DashboardPage() {
  return <main className="dashboard-page"><section className="dashboard-title"><div><span className="eyebrow">Centro de comando</span><h1>Bom ter você em órbita.</h1><p>Seu universo está pronto para receber a primeira configuração.</p></div><button className="button primary" disabled>Ver meu perfil <ArrowUpRight /></button></section><section className="metrics">{metrics.map(([Icon, label]) => <article key={label}><span><Icon /></span><div><small>{label}</small><strong>—</strong></div></article>)}</section><section className="dashboard-grid"><article className="empty-panel"><span className="empty-icon"><Rocket /></span><h2>Prepare seu lançamento</h2><p>Na próxima fase você escolherá seu username, um template inicial e adicionará os primeiros blocos ao perfil.</p><Link className="button ghost" href="/">Conhecer o NIVO</Link></article><article className="profile-placeholder"><div className="mini-profile"><div className="mini-space"><Orbit /></div><span /><h3>Seu universo</h3><p>Prévia indisponível até o onboarding.</p><div /><div /><div /></div><footer><Sparkles /> Prévia do perfil</footer></article></section></main>;
}
