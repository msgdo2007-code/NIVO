import { describe, expect, it } from "vitest";

import { classifyDevice, dedupeWindowSeconds, isObviousBot, normalizeReferrer } from "@/lib/analytics/classify";

describe("analytics classification", () => {
  it("blocks obvious automated clients", () => {
    expect(isObviousBot("Mozilla/5.0 Googlebot/2.1")).toBe(true);
    expect(isObviousBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe(false);
  });

  it("classifies common devices", () => {
    expect(classifyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile")).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)")).toBe("tablet");
    expect(classifyDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
  });

  it("keeps only external referrer hosts", () => {
    expect(normalizeReferrer("https://www.google.com/search?q=nivo", "nivo.app")).toBe("google.com");
    expect(normalizeReferrer("https://nivo.app/alguem", "nivo.app")).toBeNull();
    expect(normalizeReferrer("not a url", "nivo.app")).toBeNull();
  });

  it("uses stricter click deduplication windows", () => {
    expect(dedupeWindowSeconds("profile_view")).toBe(300);
    expect(dedupeWindowSeconds("block_click")).toBe(15);
  });
});
