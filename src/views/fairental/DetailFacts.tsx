import type { FairentalDetail } from "./fairentalApi";
import { VersionMark } from "./car-dialog/VersionMark";
import { dollars } from "./filters";

const CHIP = {
  Listed: "bg-[#C8FF3D] text-[#102400] shadow-[0_0_10px_rgba(198,255,61,0.85)]",
  Unlisted: "bg-[#FF2D3A] text-white shadow-[0_0_10px_rgba(255,45,58,0.75)]",
  Sold: "bg-[#E4E4EA] text-[#2A2A32] shadow-[0_0_10px_rgba(228,228,234,0.95)]",
};

export function DetailFacts({ car, admin }: { car: FairentalDetail; admin?: boolean }) {
  const heading = [car.year, car.make, car.model].filter(Boolean).join(" ");
  const showTitle = car.title && car.title.trim().toLowerCase() !== heading.toLowerCase();
  const status = car.isSold ? "Sold" : car.isListed ? "Listed" : "Unlisted";
  const facts = [
    ["Body", car.bodyStyle],
    ["Exterior", car.exteriorColor],
    ["Interior", car.interiorColor],
  ].filter((row) => row[1]);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {car.vin ? <p className="font-mono text-sm tracking-[0.04em] text-muted">{car.vin}</p> : null}
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 font-serif text-[28px] leading-9 tracking-[-0.03em] text-ink lg:text-[34px] lg:leading-10">
          {heading || "Fairental car"}
          {admin ? <VersionMark version={car.version} /> : null}
        </h1>
        {admin ? (
          <span className={`mt-1 shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold leading-none ${CHIP[status]}`}>
            {status}
          </span>
        ) : null}
      </div>
      {showTitle ? <p className="text-balance text-[15px] leading-6 text-muted">{car.title}</p> : null}
      {facts.length ? (
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
          {facts.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-[15px] leading-5 text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="text-3xl font-medium tracking-[-0.03em] text-ink">{dollars(car.price)}</p>
      {car.description ? <p className="max-w-prose text-[15px] leading-6 text-ink">{car.description}</p> : null}
    </div>
  );
}
