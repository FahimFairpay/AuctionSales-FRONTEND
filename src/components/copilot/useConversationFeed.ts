"use client";

import { useEffect, useRef, useState } from "react";

/** The answer list scrolls only after its column is taller than the panel. */
export function useConversationFeed(signature: string) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const measure = () => {
      const inner = feed.querySelector<HTMLElement>(".copilot-feed-inner");
      const contentHeight = inner ? inner.scrollHeight : feed.scrollHeight;
      setScrollable(contentHeight > feed.clientHeight + 8);
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(feed);
    const inner = feed.querySelector(".copilot-feed-inner");
    if (inner) resize.observe(inner);
    const mutation = new MutationObserver(measure);
    mutation.observe(feed, { childList: true, subtree: true, characterData: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [signature]);

  return { feedRef, scrollable };
}
