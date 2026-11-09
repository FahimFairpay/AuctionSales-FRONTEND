"use client";

import { useState, type MouseEvent } from "react";
import { StatusMark, type CarStatus } from "./StatusMark";

export function DetailGallery({ urls, status }: { urls: string[]; status?: CarStatus }) {
  const [index, setIndex] = useState(0);
  const current = urls[index] || urls[0];
  const canPrevious = index > 0;
  const canNext = index < urls.length - 1;

  function step(event: MouseEvent, direction: number) {
    event.preventDefault();
    event.stopPropagation();
    setIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= urls.length) return currentIndex;
      return nextIndex;
    });
  }

  return (
    <div className="relative overflow-hidden rounded-[8px] border border-hairline bg-surface-muted">
      <div className="aspect-[16/10] w-full lg:aspect-auto lg:h-[min(420px,48vh)]">
        {current ? (
          // Signed photo URLs expire, so the optimizer would cache a dead link.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No photo yet</div>
        )}
      </div>
      {status ? (
        <div className="absolute right-3 top-3 z-20">
          <StatusMark status={status} />
        </div>
      ) : null}
      {current ? (
        <>
          <PhotoStep side="left" enabled={canPrevious} onClick={(event) => step(event, -1)} />
          <PhotoStep side="right" enabled={canNext} onClick={(event) => step(event, 1)} />
        </>
      ) : null}
    </div>
  );
}

function PhotoStep({
  side,
  enabled,
  onClick,
}: {
  side: "left" | "right";
  enabled: boolean;
  onClick: (event: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      disabled={!enabled}
      className={`absolute bottom-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-sm hover:bg-black/75 disabled:cursor-default disabled:opacity-45 disabled:hover:bg-black/55 ${
        side === "left" ? "left-3" : "right-3"
      }`}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={side === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
