import { z } from "zod";

export const analyticsEventSchema = z.discriminatedUnion("eventType", [
  z.object({
    eventType: z.literal("profile_view"),
    profileId: z.uuid(),
    blockId: z.null().optional(),
    anonymousId: z.uuid(),
    referrer: z.string().max(2048).optional(),
  }).strict(),
  z.object({
    eventType: z.literal("block_click"),
    profileId: z.uuid(),
    blockId: z.uuid(),
    anonymousId: z.uuid(),
    referrer: z.string().max(2048).optional(),
  }).strict(),
]);

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
