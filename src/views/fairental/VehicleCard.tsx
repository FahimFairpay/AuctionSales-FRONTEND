"use client";

import Link from "next/link";
import { paths } from "@/routes/paths";
import type { FairentalCard } from "./fairentalApi";
import { dollars, glass, swatchHex } from "./swatches";

export function VehicleCard({
  car,
  admin,
  onEdit,
}: {
  car: FairentalCard;
  admin?: boolean;
  onEdit?: (vin: string) => void;
}) {
  const href = paths.fairentalItem(car.vin);
  return (
    <article className={`${glass} overflow-hidden rounded-[28px]`}>
      <div className="relative aspect-[16/10] bg-[var(--fs-paper)]">
        {car.coverUrl ? (
          // Signed photo URLs expire, so the optimizer would cache a dead link.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={car.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] uppercase tracking-[0.16em] text-[var(--fs-muted)]">
            Photo coming
          </div>
        )}
        {admin ? (
          <button
            type="button"
            onClick={() => onEdit?.(car.vin)}
            className="absolute right-3 top-3 rounded-full bg-[var(--fs-paper-elevated)] px-3 py-1 text-[12px] text-[var(--fs-ink)]"
            aria-label={`Edit ${car.title}`}
          >
            Edit
          </button>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            {admin ? (
              <h3 className="text-[18px] text-[var(--fs-ink)]">{car.title}</h3>
            ) : (
              <Link href={href} className="text-[18px] text-[var(--fs-ink)] no-underline">
                {car.title}
              </Link>
            )}
            <p className="text-[13px] text-[var(--fs-muted)]">
              {car.year} {car.make} {car.model}
            </p>
          </div>
          <p className="text-[18px] text-[var(--fs-claude-orange)]">{dollars(car.price)}</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[var(--fs-text-sub)]">
          <span className="h-3 w-3 rounded-full border border-[var(--fs-line)]" style={{ background: swatchHex(car.exteriorColor) }} />
          {car.bodyStyle}
          {admin && car.isSold ? <span>Sold</span> : null}
          {admin && !car.isListed && !car.isSold ? <span>Unlisted</span> : null}
        </div>
      </div>
    </article>
  );
}
