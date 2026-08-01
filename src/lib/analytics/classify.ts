export type AnalyticsDevice = "desktop" | "mobile" | "tablet" | "other";

const BOT_PATTERN = /bot|crawler|spider|slurp|headless|lighthouse|preview|facebookexternalhit|whatsapp|telegrambot|discordbot|curl|wget|python-requests/i;

export function isObviousBot(userAgent: string) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function classifyDevice(userAgent: string): AnalyticsDevice {
  if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile";
  if (/windows|macintosh|linux|cros/i.test(userAgent)) return "desktop";
  return "other";
}

export function normalizeReferrer(value: string | undefined, siteHost: string) {
  if (!value) return null;
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    const ownHost = siteHost.toLowerCase().replace(/^www\./, "");
    return host && host !== ownHost ? host.slice(0, 253) : null;
  } catch {
    return null;
  }
}

export function dedupeWindowSeconds(eventType: "profile_view" | "block_click") {
  return eventType === "profile_view" ? 300 : 15;
}
