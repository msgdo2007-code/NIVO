"use client";

import type { MouseEventHandler, ReactNode } from "react";

import { sendAnalyticsEvent } from "@/components/analytics/profile-analytics";

export function TrackedLink({
  href,
  profileId,
  blockId,
  className,
  children,
}: {
  href: string;
  profileId: string;
  blockId: string;
  className: string;
  children: ReactNode;
}) {
  const track: MouseEventHandler<HTMLAnchorElement> = () => {
    sendAnalyticsEvent({ eventType: "block_click", profileId, blockId });
  };

  return <a className={className} href={href} target="_blank" rel="noreferrer" onClick={track}>{children}</a>;
}
