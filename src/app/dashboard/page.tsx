import { ArrowUpRight, BarChart3, Eye, MousePointerClick, Orbit, PencilLine, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";

import { getOwnProfileBundle } from "@/features/profiles/queries";

const metrics = [[Eye, "Visualizações"], [UsersRound, "Visitantes únicos"], [MousePointerClick, "Cliques"], [BarChart3, "CTR"]] as const;

export default async function DashboardPage() {
  const { profile, blocks } = await getOwnProfileBundle();
  return <main className="dashboard-page"><section className="dashboard-title"><div><span className="eyebrow">Centro de comando</span><h1>Bom ter você em órbita.</h1><p>Seu perfil está {profile.is_published ? "publicado" : "em modo privado"} com {blocks.length} {blocks.length === 1 ? "bloco" : "blocos"}.</p></div>{profile.username && <Link className="button primary" href={`/${profile.username}`} target="_blank">Ver meu perfil <ArrowUpRight /></Link>}</section><section className="metrics">{metrics.map(([Icon, label]) => <article key={label}><span><Icon /></span><div><small>{label}</small><strong>—</strong></div></article>)}</section><section className="dashboard-grid"><article className="empty-panel"><span className="empty-icon"><PencilLine /></span><h2>Continue criando</h2><p>Organize seus blocos, atualize textos e experimente a aparência até o universo ficar com a sua cara.</p><Link className="button ghost" href="/dashboard/editor">Abrir editor</Link></article><article className="profile-placeholder"><div className="mini-profile"><div className="mini-space"><Orbit /></div><span /><h3>{profile.display_name}</h3><p>@{profile.username}</p>{blocks.slice(0, 3).map((block) => <div key={block.id} />)}</div><footer><Sparkles /> {profile.is_published ? "Perfil publicado" : "Perfil privado"}</footer></article></section></main>;
}
