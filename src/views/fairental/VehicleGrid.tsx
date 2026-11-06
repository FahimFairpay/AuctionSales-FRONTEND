"use client";

import type { FairentalCard } from "./fairentalApi";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({
  cars,
  admin,
  onEdit,
  loading,
}: {
  cars: FairentalCard[];
  admin?: boolean;
  onEdit?: (vin: string) => void;
  loading?: boolean;
}) {
  if (!loading && cars.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-1 items-center justify-center rounded-[28px] border border-dashed border-[var(--fs-line)] text-[var(--fs-muted)]">
        No Fairental cars match these filters.
      </div>
    );
  }
  return (
    <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-2">
      {cars.map((car) => (
        <VehicleCard key={`${car.vin}-${car.version || "live"}`} car={car} admin={admin} onEdit={onEdit} />
      ))}
    </div>
  );
}
