"use client";

import Link from "next/link";
import { paths } from "@/routes/paths";
import type { FairentalCard } from "./fairentalApi";
import { VersionMark } from "./car-dialog/VersionMark";
import { dollars } from "./filters";

export function VehicleCard({
  car,
  admin,
  onEdit,
}: {
  car: FairentalCard;
  admin?: boolean;
  onEdit?: (vin: string) => void;
}) {
  const heading = [car.year, car.make, car.model].filter(Boolean).join(" ");
  const showTitle = car.title && car.title.trim().toLowerCase() !== heading.toLowerCase();
  const spec = [car.bodyStyle, car.exteriorColor, car.interiorColor].filter(Boolean).join(" · ");
  const status = car.isSold ? "Sold" : car.isListed ? "Listed" : "Unlisted";
  const card = (
    <article className="relative h-full overflow-hidden rounded-md border border-hairline bg-surface shadow-sm">
      <div className="relative h-[184px] bg-surface-muted">
        {car.coverUrl ? (
          // Signed photo URLs expire, so the optimizer would cache a dead link.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={car.coverUrl} alt="" className="h-full w-full rounded-t-md object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">No photo yet</div>
        )}
        {admin ? (
          <button
            type="button"
            onClick={() => onEdit?.(car.vin)}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface text-ink shadow-sm hover:bg-surface-muted"
            aria-label={`Edit ${heading}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 20h4l10-10-4-4L4 16v4z" strokeLinejoin="round" />
              <path d="M13 7l4 4" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="flex min-w-0 items-baseline text-base font-medium text-ink">
            <span className="truncate">{heading}</span>
            {admin ? <VersionMark version={car.version} /> : null}
          </h3>
          {showTitle ? <p className="truncate text-sm text-muted">{car.title}</p> : null}
          {spec ? <p className="mt-1 truncate text-sm text-ink">{spec}</p> : null}
        </div>
        <p className="text-2xl font-medium text-ink">{dollars(car.price)}</p>
        <div className="min-h-6" />
        {admin ? <p className="text-sm text-muted">{status}</p> : null}
      </div>
    </article>
  );

  if (admin) return card;
  return (
    <Link href={paths.fairentalItem(car.vin)} className="block h-full text-inherit no-underline">
      {card}
    </Link>
  );
}
