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
  onEdit?: (car: FairentalCard) => void;
}) {
  const heading = [car.year, car.make, car.model].filter(Boolean).join(" ");
  const showTitle = car.title && car.title.trim().toLowerCase() !== heading.toLowerCase();
  const spec = [car.bodyStyle, car.exteriorColor, car.interiorColor].filter(Boolean).join(" · ");
  const status = car.isSold ? "Sold" : car.isListed ? "Listed" : "Unlisted";
  const chip = {
    Listed: "bg-[#C8FF3D] text-[#102400] shadow-[0_0_10px_rgba(198,255,61,0.85)]",
    Unlisted: "bg-[#FF2D3A] text-white shadow-[0_0_10px_rgba(255,45,58,0.75)]",
    Sold: "bg-[#D4D4D8] text-[#3F3F46]",
  }[status];
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
            onClick={() => onEdit?.(car)}
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
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 break-words text-base font-medium leading-5 text-ink">
              {heading}
              {admin ? <VersionMark version={car.version} /> : null}
            </h3>
            {admin ? (
              <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${chip}`}>
                {status}
              </span>
            ) : null}
          </div>
          {showTitle ? <p className="mt-0.5 break-words text-sm text-muted">{car.title}</p> : null}
          {spec ? <p className="mt-1 break-words text-sm text-ink">{spec}</p> : null}
        </div>
        <p className="text-2xl font-medium text-ink">{dollars(car.price)}</p>
        <div className="min-h-6" />
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
