import type { FairentalDetail } from "./fairentalApi";
import { VersionMark } from "./car-dialog/VersionMark";
import { dollars } from "./filters";

export function DetailFacts({ car, admin }: { car: FairentalDetail; admin?: boolean }) {
  const heading = [car.year, car.make, car.model].filter(Boolean).join(" ");
  const showTitle = car.title && car.title.trim().toLowerCase() !== heading.toLowerCase();
  const facts = [
    ["VIN", car.vin],
    ["Body", car.bodyStyle],
    ["Exterior", car.exteriorColor],
    ["Interior", car.interiorColor],
  ].filter((row) => row[1]);

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-balance font-serif text-[28px] leading-9 tracking-[-0.03em] text-ink lg:text-[34px] lg:leading-10">
            {heading || "Fairental car"}
            {admin ? <VersionMark version={car.version} /> : null}
          </h1>
          {showTitle ? <p className="mt-1 text-balance text-[15px] leading-6 text-muted">{car.title}</p> : null}
        </div>
        <p className="shrink-0 pt-1 text-right text-3xl font-medium tracking-[-0.03em] text-ink tabular-nums">
          {dollars(car.price)}
        </p>
      </div>
      {facts.length ? (
        <dl>
          {facts.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-6 border-b border-hairline py-3 first:border-t">
              <dt className="shrink-0 text-sm text-muted">{label}</dt>
              <dd className={`min-w-0 text-right text-[15px] leading-5 text-ink ${label === "VIN" ? "font-mono text-sm tracking-[0.04em]" : ""}`}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {car.description ? <p className="max-w-prose text-[15px] leading-6 text-ink">{car.description}</p> : null}
    </div>
  );
}
