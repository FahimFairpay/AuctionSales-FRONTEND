import Link from "next/link";
import { paths } from "@/routes/paths";
import type { FairentalCard } from "./fairentalApi";
import { VehicleCard } from "./VehicleCard";

export function MoreCars({ cars, admin }: { cars: FairentalCard[]; admin?: boolean }) {
  const list = admin ? paths.adminFairental : paths.fairental;
  return (
    <section className="space-y-3 pt-4">
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-serif text-xl text-ink">More cars</h2>
        <Link href={list} className="text-sm text-muted hover:text-ink">
          See all cars
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
