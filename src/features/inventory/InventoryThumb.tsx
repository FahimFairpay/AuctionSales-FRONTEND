"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { ImageGallery } from "./ImageGallery";
import { expandVisImages, type VisCandidate } from "./visImages";

export function InventoryThumb({
  src,
  title,
  className = "",
  compact = false,
  shots,
  loadShots,
}: {
  src?: string;
  title?: string;
  className?: string;
  compact?: boolean;
  shots?: VisCandidate[];
  loadShots?: () => Promise<VisCandidate[]>;
}) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [misses, setMisses] = useState(0);
  const [fetched, setFetched] = useState<VisCandidate[] | null>(null);
  const generated = useMemo(() => (src ? expandVisImages(src) : []), [src]);
  const photos = fetched && fetched.length > 0 ? fetched : shots && shots.length > 0 ? shots : generated;
  const shown = photos.length > 0 ? photos[index % photos.length] : null;
  const image = shown?.large || src;
  const canStep = photos.length > 1 || Boolean(loadShots && !fetched);
  const initial = (title || "?").slice(0, 1).toUpperCase();
  const desktop = useDesktop();

  useEffect(() => {
    if (!desktop) {
      setOpen(false);
    }
  }, [desktop]);

  function openPhotos(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!desktop) {
      return;
    }
    if (photos.length > 0) {
      setOpen(true);
      return;
    }
    if (!loadShots || loading) {
      if (src) {
        setFetched([{ thumb: src, large: src, index: 1, set: null }]);
        setOpen(true);
      }
      return;
    }
    setLoading(true);
    void loadShots()
      .then((next) => {
        const ready = next.length > 0 ? next : src ? [{ thumb: src, large: src, index: 1, set: null }] : [];
        setFetched(ready);
        setOpen(true);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }

  function step(event: MouseEvent, direction: number) {
    event.preventDefault();
    event.stopPropagation();
    if (photos.length > 1) {
      setFailed(false);
      setMisses(0);
      setIndex((current) => (current + direction + photos.length) % photos.length);
      return;
    }
    if (!loadShots || loading || fetched) {
      return;
    }
    setLoading(true);
    void loadShots()
      .then((next) => {
        const ready = next.length > 0 ? next : src ? [{ thumb: src, large: src, index: 1, set: null }] : [];
        setFetched(ready);
        if (ready.length > 1) {
          setFailed(false);
          setMisses(0);
          setIndex(direction > 0 ? 1 : ready.length - 1);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }

  if (!image || failed) {
    return (
      <span className={`flex items-center justify-center bg-surface-muted font-serif text-lg text-muted ${className}`} aria-hidden>
        {initial}
      </span>
    );
  }
  return (
    <span className={`group/thumb relative block overflow-hidden ${className}`}>
      <img
        src={image}
        alt=""
        className={`h-full w-full object-cover ${desktop ? "cursor-pointer" : ""}`}
        onClick={openPhotos}
        onError={() => {
          if (photos.length > 1 && misses < photos.length) {
            setMisses((count) => count + 1);
            setIndex((current) => (current + 1) % photos.length);
            return;
          }
          setFailed(true);
        }}
      />
      {canStep ? (
        <>
          <PhotoStep side="left" compact={compact} busy={loading} onClick={(event) => step(event, -1)} />
          <PhotoStep side="right" compact={compact} busy={loading} onClick={(event) => step(event, 1)} />
        </>
      ) : null}
      {open ? (
        <ImageGallery title={title} candidates={photos} start={photos.length > 0 ? index % photos.length : 0} onClose={() => setOpen(false)} />
      ) : null}
    </span>
  );
}

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return desktop;
}

function PhotoStep({
  side,
  compact,
  busy,
  onClick,
}: {
  side: "left" | "right";
  compact: boolean;
  busy: boolean;
  onClick: (event: MouseEvent) => void;
}) {
  const place = side === "left" ? (compact ? "bottom-1 left-1" : "bottom-2.5 left-2.5") : compact ? "bottom-1 right-1" : "bottom-2.5 right-2.5";
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      disabled={busy}
      className={`absolute z-20 inline-flex items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-sm hover:bg-black/75 disabled:opacity-60 ${
        compact ? "h-6 w-6" : "h-10 w-10"
      } ${place}`}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className={compact ? "h-3 w-3" : "h-4 w-4"} fill="none" stroke="currentColor" strokeWidth="2">
        <path d={side === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
