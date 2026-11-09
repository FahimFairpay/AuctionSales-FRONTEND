"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { adminFairental, publicFairental, type FairentalCard } from "./fairentalApi";
import type { PhotoUploadProgress } from "./photoUploadQueue";
import { StatusMark, type CarStatus } from "./StatusMark";

const POLL_WAIT_MS = 1000;
const POLL_TRIES = 20;

export function CardPhoto({
  car,
  admin,
  heading,
  onEdit,
  progress,
  onShown,
  status,
  onToggleListed,
}: {
  car: FairentalCard;
  admin?: boolean;
  heading: string;
  onEdit?: (car: FairentalCard) => void;
  progress?: PhotoUploadProgress | null;
  onShown?: () => void;
  status?: CarStatus;
  onToggleListed?: () => void;
}) {
  const [urls, setUrls] = useState<string[]>(car.coverUrl ? [car.coverUrl] : []);
  const [previews, setPreviews] = useState<string[]>([]);
  const [live, setLive] = useState(false);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState(false);
  const baseline = useRef<number | null>(null);
  const progressRef = useRef(progress);
  const onShownRef = useRef(onShown);
  progressRef.current = progress;
  onShownRef.current = onShown;

  const gallery = !live && previews.length ? [...urls, ...previews] : urls;
  const current = gallery[index] || gallery[0];
  const canStep = known || previews.length > 0;
  const canPrevious = canStep && index > 0;
  const canNext = canStep && index < gallery.length - 1;

  useEffect(() => {
    const created = (progress?.files ?? []).map((file) => URL.createObjectURL(file));
    setPreviews(created);
    setLive(false);
    return () => created.forEach((url) => URL.revokeObjectURL(url));
  }, [progress?.files]);

  useEffect(() => {
    setIndex((currentIndex) => Math.min(currentIndex, Math.max(gallery.length - 1, 0)));
  }, [gallery.length]);

  useEffect(() => {
    let gone = false;
    const load = admin ? adminFairental(car.vin, car.version) : publicFairental(car.vin);
    load.then((detail) => {
      if (gone) return;
      const next = readyUrls(detail.images);
      const row = progressRef.current;
      rememberBaseline(baseline, next.length, row);
      const finished = !!row && row.done > 0 && row.done + row.failed >= row.total;
      const target = (baseline.current ?? 0) + (finished ? row.done : 0);
      if (finished && next.length >= target && next.length > 0) {
        setUrls(next);
        setLive(true);
        if (row.failed === 0) onShownRef.current?.();
      } else if (next.length) {
        setUrls((currentUrls) => (next.length >= currentUrls.length ? next : currentUrls));
      }
      setKnown(true);
    }).catch(() => {
      if (gone) return;
      if (baseline.current === null) baseline.current = 0;
      setKnown(true);
    });
    return () => {
      gone = true;
    };
  }, [admin, car.vin, car.version]);

  useEffect(() => {
    const row = progress;
    if (!admin || !row || row.done === 0 || row.done + row.failed < row.total) return;
    let gone = false;
    let tries = 0;
    let timer = 0;

    const tick = () => {
      adminFairental(car.vin, car.version).then((detail) => {
        if (gone) return;
        const next = readyUrls(detail.images);
        const target = (baseline.current ?? 0) + row.done;
        if (next.length >= target && next.length > 0) {
          setUrls(next);
          setLive(true);
          if (row.failed === 0) onShownRef.current?.();
          return;
        }
        tries += 1;
        if (tries >= POLL_TRIES) return;
        timer = window.setTimeout(tick, POLL_WAIT_MS);
      }).catch(() => {
        if (gone) return;
        tries += 1;
        if (tries >= POLL_TRIES) return;
        timer = window.setTimeout(tick, POLL_WAIT_MS);
      });
    };

    tick();
    return () => {
      gone = true;
      window.clearTimeout(timer);
    };
  }, [admin, car.vin, car.version, progress?.done, progress?.failed, progress?.total]);

  function step(event: MouseEvent, direction: number) {
    event.preventDefault();
    event.stopPropagation();
    setIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= gallery.length) return currentIndex;
      return nextIndex;
    });
  }

  const image = current ? (
    // Signed photo URLs expire, so the optimizer would cache a dead link.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={current} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center text-xs text-muted">No photo yet</div>
  );

  return (
    <div className="relative h-[168px] bg-surface-muted">
      {image}
      {progress ? <UploadStatus progress={progress} /> : null}
      {current ? (
        <>
          <PhotoStep side="left" enabled={canPrevious} onClick={(event) => step(event, -1)} />
          <PhotoStep side="right" enabled={canNext} onClick={(event) => step(event, 1)} />
        </>
      ) : null}
      {admin ? (
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onEdit?.(car);
          }}
          className="absolute left-2 top-2 z-30 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white shadow-[0_4px_14px_rgba(0,0,0,0.28)] backdrop-blur-md transition-colors hover:bg-black/70"
          aria-label={car.isSold ? `View ${heading}` : `Edit ${heading}`}
        >
          {car.isSold ? (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
              <path d="M13 7l4 4" strokeLinecap="round" />
            </svg>
          )}
        </button>
      ) : null}
      {status ? (
        <div className="absolute right-2 top-2 z-30">
          <StatusMark status={status} onToggle={status === "Sold" ? undefined : onToggleListed} />
        </div>
      ) : null}
    </div>
  );
}

function readyUrls(images: { url?: string }[] | undefined): string[] {
  return (images || []).map((image) => image.url || "").filter(Boolean);
}

function rememberBaseline(baseline: { current: number | null }, count: number, row?: PhotoUploadProgress | null) {
  if (baseline.current !== null) return;
  const added = row?.done ?? 0;
  const finished = !!row && row.done + row.failed >= row.total;
  baseline.current = finished && added > 0 && count >= added ? count - added : count;
}

function UploadStatus({ progress }: { progress: PhotoUploadProgress }) {
  const finished = progress.done + progress.failed >= progress.total && progress.failed > 0;
  const label = finished
    ? `${progress.failed} ${progress.failed === 1 ? "photo" : "photos"} failed`
    : `Uploading photos ${progress.done} / ${progress.total}`;
  return (
    <p className="absolute inset-x-2 bottom-12 z-20 rounded-full bg-black/70 px-2 py-1 text-center text-[11px] font-medium text-white">
      {label}
    </p>
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
      className={`absolute bottom-2.5 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-sm hover:bg-black/75 disabled:cursor-default disabled:opacity-45 disabled:hover:bg-black/55 ${
        side === "left" ? "left-2.5" : "right-2.5"
      }`}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d={side === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
