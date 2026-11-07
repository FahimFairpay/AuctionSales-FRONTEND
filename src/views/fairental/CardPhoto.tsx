"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { paths } from "@/routes/paths";
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
  const [busy, setBusy] = useState(false);
  const current = urls[index] || urls[0];
  const showArrows = Boolean(car.coverUrl) && (!known || urls.length > 1);

  async function step(event: MouseEvent, direction: number) {
    event.preventDefault();
    event.stopPropagation();
    let list = urls;
    if (!known) {
      setBusy(true);
      try {
        const detail = admin ? await adminFairental(car.vin, car.version) : await publicFairental(car.vin);
        const next = (detail.images || []).map((image) => image.url).filter(Boolean);
        list = next.length ? next : list;
        setUrls(list);
        setKnown(true);
      } catch {
        setKnown(true);
      } finally {
        setBusy(false);
      }
    }
    if (list.length < 2) return;
    setIndex((currentIndex) => (currentIndex + direction + list.length) % list.length);
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
      {admin || !car.vin ? image : (
        <Link href={paths.fairentalItem(car.vin)} className="block h-full text-inherit no-underline">
          {image}
        </Link>
      )}
      {showArrows ? (
        <>
          <PhotoStep side="left" busy={busy} onClick={(event) => void step(event, -1)} />
          <PhotoStep side="right" busy={busy} onClick={(event) => void step(event, 1)} />
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
  busy,
  onClick,
}: {
  side: "left" | "right";
  busy: boolean;
  onClick: (event: MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      disabled={busy}
      className={`absolute bottom-2.5 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] backdrop-blur-sm hover:bg-black/75 disabled:opacity-60 ${
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
