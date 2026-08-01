export type AnalyticsSummary = {
  periodDays: number;
  totals: { views: number; uniqueVisitors: number; clicks: number };
  series: Array<{ day: string; views: number; uniqueVisitors: number; clicks: number }>;
  devices: Array<{ name: string; value: number }>;
  sources: Array<{ name: string; value: number }>;
  topLinks: Array<{ blockId: string; title: string; clicks: number }>;
  recentActivity: Array<{
    id: number;
    type: "profile_view" | "block_click";
    title: string | null;
    occurredAt: string;
  }>;
};
