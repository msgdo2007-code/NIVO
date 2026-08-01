"use client";

import { Activity, BarChart3, Eye, Globe2, Laptop, MousePointerClick, Smartphone, Tablet, UsersRound } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsSummary } from "@/types/analytics";

const number = new Intl.NumberFormat("pt-BR");
const COLORS = ["#72f7bd", "#5dd9ff", "#9a7cff", "#f6ca6b"];
const DEVICE_LABELS: Record<string, string> = { desktop: "Desktop", mobile: "Celular", tablet: "Tablet", other: "Outro" };

function shortDay(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function activityDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function EmptyData({ children }: { children: string }) {
  return <div className="analytics-empty"><BarChart3 /><span>{children}</span></div>;
}

export function AnalyticsDashboard({ summary }: { summary: AnalyticsSummary }) {
  const ctr = summary.totals.views > 0 ? (summary.totals.clicks / summary.totals.views) * 100 : 0;
  const metrics = [
    { label: "Visualizações", value: number.format(summary.totals.views), icon: Eye },
    { label: "Visitantes únicos", value: number.format(summary.totals.uniqueVisitors), icon: UsersRound },
    { label: "Cliques", value: number.format(summary.totals.clicks), icon: MousePointerClick },
    { label: "CTR", value: `${ctr.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`, icon: BarChart3 },
  ];
  const deviceData = summary.devices.map((item) => ({ ...item, label: DEVICE_LABELS[item.name] ?? "Outro" }));

  return <>
    <section className="metrics" aria-label={`Métricas dos últimos ${summary.periodDays} dias`}>
      {metrics.map(({ icon: Icon, label, value }) => <article key={label}><span><Icon /></span><div><small>{label}</small><strong>{value}</strong></div></article>)}
    </section>

    <section className="analytics-layout">
      <article className="analytics-card analytics-trend">
        <header><div><span className="eyebrow">Desempenho</span><h2>Tráfego nos últimos {summary.periodDays} dias</h2></div><small><i /> Visualizações <i /> Cliques</small></header>
        {summary.totals.views === 0 && summary.totals.clicks === 0 ? <EmptyData>As primeiras visitas aparecerão aqui.</EmptyData> : <div className="analytics-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={summary.series} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#72f7bd" stopOpacity={0.35} /><stop offset="100%" stopColor="#72f7bd" stopOpacity={0} /></linearGradient><linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9a7cff" stopOpacity={0.25} /><stop offset="100%" stopColor="#9a7cff" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} /><XAxis dataKey="day" tickFormatter={shortDay} stroke="#65747c" fontSize={10} tickLine={false} axisLine={false} minTickGap={28} /><YAxis allowDecimals={false} stroke="#65747c" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ background: "#101820", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }} labelFormatter={(label) => shortDay(String(label))} /><Area type="monotone" dataKey="views" name="Visualizações" stroke="#72f7bd" fill="url(#viewsFill)" strokeWidth={2} /><Area type="monotone" dataKey="clicks" name="Cliques" stroke="#9a7cff" fill="url(#clicksFill)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>}
      </article>

      <article className="analytics-card">
        <header><div><span className="eyebrow">Dispositivos</span><h2>Como acessam</h2></div><Laptop /></header>
        {deviceData.length === 0 ? <EmptyData>Sem dispositivos no período.</EmptyData> : <><div className="device-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deviceData} dataKey="value" nameKey="label" innerRadius={50} outerRadius={76} paddingAngle={4}>{deviceData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: "#101820", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }} /></PieChart></ResponsiveContainer></div><div className="device-legend">{deviceData.map((item, index) => <span key={item.name}><i style={{ background: COLORS[index % COLORS.length] }} />{item.name === "mobile" ? <Smartphone /> : item.name === "tablet" ? <Tablet /> : <Laptop />}{item.label}<strong>{number.format(item.value)}</strong></span>)}</div></>}
      </article>

      <article className="analytics-card analytics-list-card">
        <header><div><span className="eyebrow">Conversão</span><h2>Links mais clicados</h2></div><MousePointerClick /></header>
        {summary.topLinks.length === 0 ? <EmptyData>Os cliques válidos aparecerão aqui.</EmptyData> : <ol className="rank-list">{summary.topLinks.map((item, index) => <li key={item.blockId}><b>{index + 1}</b><span>{item.title}</span><strong>{number.format(item.clicks)} {item.clicks === 1 ? "clique" : "cliques"}</strong></li>)}</ol>}
      </article>

      <article className="analytics-card analytics-list-card">
        <header><div><span className="eyebrow">Aquisição</span><h2>Origem do tráfego</h2></div><Globe2 /></header>
        {summary.sources.length === 0 ? <EmptyData>As origens das visitas aparecerão aqui.</EmptyData> : <ol className="source-list">{summary.sources.map((item) => <li key={item.name}><span>{item.name}</span><strong>{number.format(item.value)}</strong><i><b style={{ width: `${Math.max(4, (item.value / summary.sources[0].value) * 100)}%` }} /></i></li>)}</ol>}
      </article>

      <article className="analytics-card analytics-activity">
        <header><div><span className="eyebrow">Ao vivo</span><h2>Atividade recente</h2></div><Activity /></header>
        {summary.recentActivity.length === 0 ? <EmptyData>Não há atividade válida neste período.</EmptyData> : <ul>{summary.recentActivity.map((item) => <li key={item.id}><span className={item.type === "block_click" ? "click" : "view"}>{item.type === "block_click" ? <MousePointerClick /> : <Eye />}</span><div><strong>{item.type === "block_click" ? `Clique em ${item.title || "um link"}` : "Nova visualização do perfil"}</strong><small>{activityDate(item.occurredAt)}</small></div></li>)}</ul>}
      </article>
    </section>
  </>;
}
