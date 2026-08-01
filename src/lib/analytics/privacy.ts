import "server-only";

import { createHmac } from "node:crypto";

import type { AnalyticsEventInput } from "@/lib/validations/analytics";
import { dedupeWindowSeconds } from "@/lib/analytics/classify";

function getAnalyticsSecret() {
  const secret = process.env.ANALYTICS_HASH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ANALYTICS_HASH_SECRET deve ter pelo menos 32 caracteres.");
  }
  return secret;
}

function hmac(value: string) {
  return createHmac("sha256", getAnalyticsSecret()).update(value).digest("hex");
}

export function buildAnalyticsHashes({
  input,
  ipAddress,
  userAgent,
  now = new Date(),
}: {
  input: AnalyticsEventInput;
  ipAddress: string;
  userAgent: string;
  now?: Date;
}) {
  const day = now.toISOString().slice(0, 10);
  const networkHash = hmac(`network|${day}|${ipAddress}|${userAgent}`);
  const anonymousHash = hmac(`anonymous|${day}|${input.anonymousId}`);
  // A identidade enviada pelo navegador é registrada de forma pseudônima, mas
  // não controla unicidade: trocar o localStorage não pode criar visitantes.
  const visitorHash = hmac(`visitor|${day}|${networkHash}`);
  const bucket = Math.floor(now.getTime() / (dedupeWindowSeconds(input.eventType) * 1000));
  const dedupeKey = hmac(`dedupe|${input.eventType}|${input.profileId}|${input.blockId ?? "profile"}|${visitorHash}|${bucket}`);

  return { visitorHash, networkHash, anonymousHash, dedupeKey };
}
