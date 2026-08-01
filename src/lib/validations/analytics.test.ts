import { describe, expect, it } from "vitest";

import { analyticsEventSchema } from "@/lib/validations/analytics";

const profileId = "60e9c3ca-af15-4b21-a6a3-2bf936eed513";
const blockId = "5316b679-2868-4208-a614-75667a226796";
const anonymousId = "1f2a497d-0fc9-485b-9f33-2bddc6ba9af6";

describe("analyticsEventSchema", () => {
  it("accepts a minimal profile view", () => {
    expect(analyticsEventSchema.safeParse({ eventType: "profile_view", profileId, anonymousId }).success).toBe(true);
  });

  it("requires a block for clicks", () => {
    expect(analyticsEventSchema.safeParse({ eventType: "block_click", profileId, anonymousId }).success).toBe(false);
    expect(analyticsEventSchema.safeParse({ eventType: "block_click", profileId, blockId, anonymousId }).success).toBe(true);
  });

  it("rejects unexpected client metadata", () => {
    expect(analyticsEventSchema.safeParse({ eventType: "profile_view", profileId, anonymousId, ip: "127.0.0.1" }).success).toBe(false);
  });
});
