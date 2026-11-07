"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { adminFairental, publicFairental, type FairentalCard } from "./fairentalApi";

export function CardPhoto({
  car,
  admin,
  heading,
  onEdit,
}: {
  car: FairentalCard;
  admin?: boolean;
  heading: string;
  onEdit?: (car: FairentalCard) => void;
}) {
  const [urls, setUrls] = useState<string[]>(car.coverUrl ? [car.coverUrl] : []);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState(false);
  const current = urls[index] || urls[0];
  const canPrevious = known && index > 0;
  const canNext = known && index < urls.length - 1;

  useEffect(() => {
    let gone = false;
    const load = admin ? adminFairental(car.vin, car.version) : publicFairental(car.vin);
    load.then((detail) => {
      if (gone) return;
      const next = (detail.images || []).map((image) => image.url).filter(Boolean);
      if (next.length) setUrls(next);
      setKnown(true);
    }).catch(() => {
      if (!gone) setKnown(true);
    });
    return () => {
      gone = true;
    };
  }, [admin, car.vin, car.version]);

  function step(event: MouseEvent, direction: number) {
    event.preventDefault();
    event.stopPropagation();
    setIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= urls.length) return currentIndex;
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
      {current ? (
        <>
          <PhotoStep side="left" enabled={canPrevious} onClick={(event) => step(event, -1)} />
          <PhotoStep side="right" enabled={canNext} onClick={(event) => step(event, 1)} />
        </>
      ) : null}
      {admin ? (
        <button
          type="button"
          onClick={() => onEdit?.(car)}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface text-ink shadow-sm hover:bg-surface-muted"
          aria-label={car.isSold ? `View ${heading}` : `Edit ${heading}`}
        >
          {car.isSold ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
              <path d="M13 7l4 4" strokeLinecap="round" />
            </svg>
          )}
        </button>
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
