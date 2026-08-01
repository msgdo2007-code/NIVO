import "server-only";

import { z } from "zod";

import { requireUser } from "@/lib/permissions/auth";
import type { AnalyticsSummary } from "@/types/analytics";

const summarySchema = z.object({
  period_days: z.number().int().min(7).max(90),
  totals: z.object({
    views: z.number().int().nonnegative(),
    unique_visitors: z.number().int().nonnegative(),
    clicks: z.number().int().nonnegative(),
  }),
  series: z.array(z.object({
    day: z.string(),
    views: z.number().int().nonnegative(),
    unique_visitors: z.number().int().nonnegative(),
    clicks: z.number().int().nonnegative(),
  })),
  devices: z.array(z.object({ name: z.string(), value: z.number().int().nonnegative() })),
  sources: z.array(z.object({ name: z.string(), value: z.number().int().nonnegative() })),
  top_links: z.array(z.object({
    block_id: z.uuid(),
    title: z.string(),
    clicks: z.number().int().nonnegative(),
  })),
  recent_activity: z.array(z.object({
    id: z.number().int().nonnegative(),
    type: z.enum(["profile_view", "block_click"]),
    title: z.string().nullable(),
    occurred_at: z.string(),
  })),
});

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("get_analytics_summary", { requested_days: days });
  if (error) throw new Error("Não foi possível carregar os analytics.");

  const parsed = summarySchema.safeParse(data);
  if (!parsed.success) throw new Error("O resumo de analytics retornou um formato inválido.");
  const summary = parsed.data;

  return {
    periodDays: summary.period_days,
    totals: {
      views: summary.totals.views,
      uniqueVisitors: summary.totals.unique_visitors,
      clicks: summary.totals.clicks,
    },
    series: summary.series.map((item) => ({
      day: item.day,
      views: item.views,
      uniqueVisitors: item.unique_visitors,
      clicks: item.clicks,
    })),
    devices: summary.devices,
    sources: summary.sources,
    topLinks: summary.top_links.map((item) => ({ blockId: item.block_id, title: item.title, clicks: item.clicks })),
    recentActivity: summary.recent_activity.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      occurredAt: item.occurred_at,
    })),
  };
}
