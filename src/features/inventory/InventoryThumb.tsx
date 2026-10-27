"use client";

import { useMemo, useState } from "react";
import { ImageGallery } from "./ImageGallery";
import { expandVisImages, type VisCandidate } from "./visImages";

export function InventoryThumb({
  src,
  title,
  className = "",
  compact = false,
  shots,
}: {
  src?: string;
  title?: string;
  className?: string;
  compact?: boolean;
  shots?: VisCandidate[];
}) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const generated = useMemo(() => (src ? expandVisImages(src) : []), [src]);
  const photos = shots && shots.length > 0 ? shots : generated;
  const initial = (title || "?").slice(0, 1).toUpperCase();
  if (!src || failed) {
    return (
      <span className={`flex items-center justify-center bg-surface-muted font-serif text-lg text-muted ${className}`} aria-hidden>
        {initial}
      </span>
    );
  }
  return (
    <span className={`group/thumb relative block overflow-hidden ${className}`}>
      <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      {photos.length > 0 ? (
        <button
          type="button"
          aria-label="All images"
          className={`absolute z-10 inline-flex max-w-[calc(100%-0.5rem)] items-center justify-center rounded-full border border-white/20 bg-[#141413] text-white shadow-[0_4px_12px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out group-hover/thumb:w-auto group-hover/thumb:bg-accent ${
            compact ? "bottom-1 right-1 h-6 w-6 group-hover/thumb:px-1" : "bottom-2 right-2 h-8 w-8 group-hover/thumb:px-1.5"
          }`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}
        >
          <span className={`inline-flex shrink-0 items-center justify-center ${compact ? "h-6 w-6" : "h-8 w-8"}`}>
            <svg viewBox="0 0 24 24" className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3z" strokeLinejoin="round" />
              <path d="M3 12l9 4.5L21 12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 16.5L12 21l9-4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={`max-w-0 overflow-hidden font-semibold whitespace-nowrap opacity-0 transition-all duration-200 group-hover/thumb:max-w-24 group-hover/thumb:opacity-100 ${compact ? "text-[10px] group-hover/thumb:ml-1" : "text-[11px] group-hover/thumb:ml-1.5"}`}>
            All Images
          </span>
        </button>
      ) : null}
      {open ? <ImageGallery title={title} candidates={photos} onClose={() => setOpen(false)} /> : null}
    </span>
  );
}
