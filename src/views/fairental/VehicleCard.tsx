"use client";

import Link from "next/link";
import type { FairentalCard } from "./fairentalApi";
import type { PhotoUploadProgress } from "./photoUploadQueue";
import { VersionMark } from "./car-dialog/VersionMark";
import { dollars } from "./filters";
import { CardPhoto } from "./CardPhoto";
import { carStatus } from "./StatusMark";

export function VehicleCard({
  car,
  admin,
  onEdit,
  onToggleListed,
  upload,
  onUploadShown,
  href,
}: {
  car: FairentalCard;
  admin?: boolean;
  onEdit?: (car: FairentalCard) => void;
  onToggleListed?: (car: FairentalCard) => void;
  upload?: PhotoUploadProgress | null;
  onUploadShown?: (upload: PhotoUploadProgress) => void;
  href?: string;
}) {
  const heading = [car.year, car.make, car.model].filter(Boolean).join(" ");
  const showTitle = car.title && car.title.trim().toLowerCase() !== heading.toLowerCase();
  const status = carStatus(car);
  const facts = [
    ["VIN", car.vin],
    ["Body", car.bodyStyle],
    ["Exterior", car.exteriorColor],
    ["Interior", car.interiorColor],
  ].filter((row) => row[1]);

  return (
    <article className="relative h-full overflow-hidden rounded-md border border-hairline bg-surface shadow-sm">
      {href ? <Link href={href} className="absolute inset-0 z-10" aria-label={heading || car.vin} /> : null}
      <CardPhoto
        car={car}
        admin={admin}
        heading={heading}
        onEdit={onEdit}
        progress={upload}
        onShown={upload && onUploadShown ? () => onUploadShown(upload) : undefined}
        status={admin ? status : undefined}
        onToggleListed={onToggleListed ? () => onToggleListed(car) : undefined}
      />
      <div className="flex flex-col gap-3 p-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-balance text-[15px] font-medium leading-5 tracking-[-0.02em] text-ink">
              {heading || "Car"}
              {admin ? <VersionMark version={car.version} /> : null}
            </h3>
            {showTitle ? <p className="mt-0.5 text-balance text-[13px] leading-5 text-muted">{car.title}</p> : null}
          </div>
          <p className="shrink-0 text-right text-lg font-medium leading-5 tracking-[-0.03em] text-ink tabular-nums">
            {dollars(car.price)}
          </p>
        </div>
        {facts.length ? (
          <dl className="grid grid-cols-[max-content_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1.5 text-[13px] leading-5">
            {facts.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted">{label}</dt>
                <dd className={`min-w-0 text-right text-ink ${label === "VIN" ? "font-mono text-[12px] tracking-[0.03em]" : ""}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </article>
  );
}
