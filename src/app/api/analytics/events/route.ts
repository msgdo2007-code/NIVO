import { NextResponse } from "next/server";

import { buildAnalyticsHashes } from "@/lib/analytics/privacy";
import { classifyDevice, isObviousBot, normalizeReferrer } from "@/lib/analytics/classify";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyticsEventSchema } from "@/lib/validations/analytics";

export const runtime = "nodejs";

function requestHost(request: Request) {
  return request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
    ?? request.headers.get("host")
    ?? new URL(request.url).host;
}

function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === requestHost(request);
  } catch {
    return false;
  }
}

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4096 || !request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ accepted: false }, { status: 415 });
  }
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ accepted: false }, { status: 403 });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  if (isObviousBot(userAgent)) {
    return NextResponse.json({ accepted: false }, { status: 202 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }
  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const input = parsed.data;
  const hashes = buildAnalyticsHashes({ input, ipAddress: clientIp(request), userAgent });
  const countryHeader = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  const countryCode = countryHeader && /^[A-Z]{2}$/.test(countryHeader) ? countryHeader : null;
  const referrerHost = normalizeReferrer(input.referrer, requestHost(request));
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("record_analytics_event", {
    requested_profile_id: input.profileId,
    requested_block_id: input.blockId ?? null,
    requested_event_type: input.eventType,
    requested_visitor_hash: hashes.visitorHash,
    requested_network_hash: hashes.networkHash,
    requested_anonymous_hash: hashes.anonymousHash,
    requested_dedupe_key: hashes.dedupeKey,
    requested_referrer_host: referrerHost,
    requested_device_type: classifyDevice(userAgent),
    requested_country_code: countryCode,
  });

  if (error) {
    console.error("analytics_event_rejected", { code: error.code });
    return NextResponse.json({ accepted: false }, { status: 503 });
  }

  return NextResponse.json({ accepted: data === true }, { status: 202 });
}
