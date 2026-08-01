"use client";

import { useEffect } from "react";

const ANONYMOUS_KEY = "nivo:anonymous-id";
let memoryAnonymousId: string | null = null;

function getAnonymousId() {
  if (memoryAnonymousId) return memoryAnonymousId;
  const created = window.crypto.randomUUID();
  try {
    const stored = window.localStorage.getItem(ANONYMOUS_KEY);
    if (stored) return stored;
    window.localStorage.setItem(ANONYMOUS_KEY, created);
  } catch {
    // Navegadores com storage desativado mantêm um ID apenas nesta aba.
  }
  memoryAnonymousId = created;
  return memoryAnonymousId;
}

export function sendAnalyticsEvent(input: { eventType: "profile_view" | "block_click"; profileId: string; blockId?: string }) {
  const payload = JSON.stringify({
    ...input,
    anonymousId: getAnonymousId(),
    referrer: document.referrer || undefined,
  });

  void fetch("/api/analytics/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
    credentials: "same-origin",
  });
}

export function ProfileAnalytics({ profileId }: { profileId: string }) {
  useEffect(() => {
    const sessionKey = `nivo:view:${profileId}`;
    try {
      if (window.sessionStorage.getItem(sessionKey)) return;
      window.sessionStorage.setItem(sessionKey, "1");
    } catch {
      // A deduplicação no banco continua ativa mesmo sem sessionStorage.
    }
    sendAnalyticsEvent({ eventType: "profile_view", profileId });
  }, [profileId]);

  return null;
}
