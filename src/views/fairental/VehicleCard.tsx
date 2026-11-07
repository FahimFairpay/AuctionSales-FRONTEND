"use client";

import type { FairentalCard } from "./fairentalApi";
import { VersionMark } from "./car-dialog/VersionMark";
import { dollars } from "./filters";
import { CardPhoto } from "./CardPhoto";

const CHIP = {
  Listed: "bg-[#C8FF3D] text-[#102400] shadow-[0_0_10px_rgba(198,255,61,0.85)]",
  Unlisted: "bg-[#FF2D3A] text-white shadow-[0_0_10px_rgba(255,45,58,0.75)]",
  Sold: "bg-[#E4E4EA] text-[#2A2A32] shadow-[0_0_10px_rgba(228,228,234,0.95)]",
};

export function VehicleCard({
  car,
  admin,
  onEdit,
  onToggleListed,
}: {
  car: FairentalCard;
  admin?: boolean;
  onEdit?: (car: FairentalCard) => void;
  onToggleListed?: (car: FairentalCard) => void;
}) {
  const heading = [car.year, car.make, car.model].filter(Boolean).join(" ");
  const showTitle = car.title && car.title.trim().toLowerCase() !== heading.toLowerCase();
  const spec = [car.bodyStyle, car.exteriorColor, car.interiorColor].filter(Boolean).join(" · ");
  const status = car.isSold ? "Sold" : car.isListed ? "Listed" : "Unlisted";
  const chip = (
    <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${CHIP[status]}`}>
      {status}
    </span>
  );
  const copy = (
    <div className="flex flex-col gap-2 p-3">
      <div className="min-w-0">
        {car.vin ? <p className="mb-1 font-mono text-[12px] tracking-[0.04em] text-muted">{car.vin}</p> : null}
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 max-w-[12rem] text-balance text-[15px] font-medium leading-5 tracking-[-0.02em] text-ink">
            {heading}
            {admin ? <VersionMark version={car.version} /> : null}
          </h3>
          {admin ? (
            car.isSold ? chip : (
              <button
                type="button"
                className="shrink-0"
                aria-label={car.isListed ? "Unlist this car" : "List this car"}
                onClick={() => onToggleListed?.(car)}
              >
                {chip}
              </button>
            )
          ) : null}
        </div>
        {showTitle ? <p className="mt-0.5 max-w-[14rem] text-balance text-[13px] leading-5 text-muted">{car.title}</p> : null}
        {spec ? <p className="mt-1 max-w-[14rem] truncate text-[13px] leading-5 text-ink">{spec}</p> : null}
      </div>
      <p className="text-xl font-medium text-ink">{dollars(car.price)}</p>
      <div className="min-h-5" />
    </div>
  );

  return (
    <article className="relative h-full overflow-hidden rounded-md border border-hairline bg-surface shadow-sm">
      <CardPhoto car={car} admin={admin} heading={heading} onEdit={onEdit} />
      {copy}
    </article>
  );
}
