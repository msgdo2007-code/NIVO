import { ArrowUpRight, Orbit, Sparkles } from "lucide-react";
import Link from "next/link";

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getAnalyticsSummary } from "@/features/analytics/queries";
import { getOwnProfileBundle } from "@/features/profiles/queries";

export default async function DashboardPage() {
  const [{ profile, blocks }, summary] = await Promise.all([
    getOwnProfileBundle(),
    getAnalyticsSummary(30),
  ]);

  return <main className="dashboard-page">
    <section className="dashboard-title"><div><span className="eyebrow">Centro de comando</span><h1>Seu universo em números.</h1><p>Dados reais e protegidos dos últimos 30 dias.</p></div>{profile.username && <Link className="button primary" href={`/${profile.username}`} target="_blank">Ver meu perfil <ArrowUpRight /></Link>}</section>
    <AnalyticsDashboard summary={summary} />
    <section className="dashboard-preview-strip"><div><span className="eyebrow">Perfil</span><h2>{profile.display_name}</h2><p>@{profile.username} · {blocks.length} {blocks.length === 1 ? "bloco" : "blocos"} · {profile.is_published ? "publicado" : "privado"}</p><Link className="button ghost" href="/dashboard/editor">Editar perfil <Sparkles /></Link></div><div className="mini-profile"><div className="mini-space"><Orbit /></div><span /><h3>{profile.display_name}</h3><p>@{profile.username}</p>{blocks.slice(0, 3).map((block) => <div key={block.id} />)}</div></section>
  </main>;
}
