"use client";

import Link from "next/link";
import { paths } from "@/routes/paths";
import type { FairentalCard } from "./fairentalApi";
import { VersionMark } from "./car-dialog/VersionMark";
import { dollars } from "./filters";
import { CardPhoto } from "./CardPhoto";

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
  const copy = (
    <div className="flex flex-col gap-2 p-3">
      <div className="min-w-0">
        <div className="flex items-start gap-1.5">
          <h3 className="w-fit max-w-[12rem] text-balance text-[15px] font-medium leading-5 tracking-[-0.02em] text-ink">
            {heading}
            {admin ? <VersionMark version={car.version} /> : null}
          </h3>
          {admin ? (
            <span className={`mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${chip}`}>
              {status}
            </span>
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
      {admin ? copy : (
        <Link href={paths.fairentalItem(car.vin)} className="block text-inherit no-underline">
          {copy}
        </Link>
      )}
    </article>
  );
}
