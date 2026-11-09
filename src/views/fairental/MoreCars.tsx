import Link from "next/link";
import { paths } from "@/routes/paths";
import type { FairentalCard } from "./fairentalApi";
import { VehicleCard } from "./VehicleCard";

export function MoreCars({ cars, admin }: { cars: FairentalCard[]; admin?: boolean }) {
  const list = admin ? paths.adminFairental : paths.fairental;
  return (
    <section className="space-y-4 border-t border-hairline pt-6">
      <div className="flex flex-nowrap items-center justify-between gap-4">
        <h2 className="min-w-0 font-serif text-[22px] leading-none tracking-[-0.03em] text-ink">More cars</h2>
        <Link
          href={list}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-hairline bg-surface px-3 text-[13px] font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          See all cars
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
      {cars.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cars.map((car) => (
            <VehicleCard
              key={`${car.vin}-${car.version || "live"}`}
              car={car}
              admin={admin}
              href={admin ? paths.adminFairentalItem(car.vin) : paths.fairentalItem(car.vin)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
