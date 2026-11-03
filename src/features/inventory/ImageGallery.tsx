"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { VisCandidate } from "./visImages";

const MIN_EDGE = 48;

export function ImageGallery({
  title,
  candidates,
  start = 0,
  onClose,
}: {
  title?: string;
  candidates: VisCandidate[];
  start?: number;
  onClose: () => void;
}) {
  const [ready, setReady] = useState<VisCandidate[] | null>(null);
  const [index, setIndex] = useState(start);

  useEffect(() => {
    let cancel = false;
    setReady(null);
    setIndex(start);
    void keepLoaded(candidates).then((kept) => {
      if (!cancel) {
        setReady(kept);
        setIndex((current) => (kept.length === 0 ? 0 : Math.min(current, kept.length - 1)));
      }
    });
    return () => {
      cancel = true;
    };
  }, [candidates, start]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => step(current, -1, ready?.length ?? 0));
      }
      if (event.key === "ArrowRight") {
        setIndex((current) => step(current, 1, ready?.length ?? 0));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, ready?.length]);

  const shot = ready?.[index];
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 backdrop-blur-[12px]" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ? `${title} photos` : "Vehicle photos"}
        className="flex max-h-[92vh] w-full max-w-[1060px] flex-col overflow-hidden rounded-[8px] border border-hairline bg-surface shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
          <h2 className="truncate font-serif text-xl text-ink">{title || "Photos"}</h2>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted hover:text-ink"
            aria-label="Close"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        <div className="flex min-h-0 flex-col gap-4 p-5">
          <div className="relative flex h-[min(460px,52vh)] items-center justify-center overflow-hidden rounded-[8px] bg-[#141413]">
            {ready === null ? (
              <p className="text-sm text-[#f5f0e8]/70">Loading photos</p>
            ) : ready.length === 0 ? (
              <p className="px-6 text-center text-sm text-[#f5f0e8]/70">None of these photos loaded.</p>
            ) : shot ? (
              <img src={shot.large} alt="" className="max-h-full max-w-full object-contain" />
            ) : null}
            {ready && ready.length > 1 ? (
              <>
                <NavButton side="left" label="Previous photo" onClick={() => setIndex((current) => step(current, -1, ready.length))} />
                <NavButton side="right" label="Next photo" onClick={() => setIndex((current) => step(current, 1, ready.length))} />
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/75 px-3 py-1 text-[11px] font-semibold text-white">
                  {index + 1} / {ready.length}
                </p>
              </>
            ) : null}
          </div>
          {ready && ready.length > 0 ? (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {ready.map((item, itemIndex) => (
                <button
                  key={item.thumb}
                  type="button"
                  aria-label={`Photo ${itemIndex + 1}`}
                  aria-current={itemIndex === index}
                  className={`h-[54px] w-[78px] shrink-0 overflow-hidden rounded-[4px] border-2 bg-black ${
                    itemIndex === index ? "border-accent opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  onClick={() => setIndex(itemIndex)}
                >
                  <img src={item.thumb} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function NavButton({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`absolute top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white hover:border-accent hover:bg-accent ${
        side === "left" ? "left-4" : "right-4"
      }`}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function step(current: number, direction: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return (current + direction + total) % total;
}

async function keepLoaded(candidates: VisCandidate[]): Promise<VisCandidate[]> {
  const flags = await Promise.all(candidates.map((shot) => loads(shot.thumb)));
  return candidates.filter((_, index) => flags[index]);
}

function loads(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timer);
      resolve(ok);
    };
    const timer = window.setTimeout(() => finish(false), 8000);
    image.onload = () => finish(image.naturalWidth >= MIN_EDGE && image.naturalHeight >= MIN_EDGE);
    image.onerror = () => finish(false);
    image.src = src;
  });
}
