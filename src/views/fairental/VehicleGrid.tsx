"use client";

import { EmptyState } from "@/components/EmptyState";
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
  onEdit?: (car: FairentalCard) => void;
  loading?: boolean;
}) {
  if (!loading && cars.length === 0) {
    return <EmptyState>No cars match these filters.</EmptyState>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cars.map((car) => (
        <VehicleCard key={`${car.vin}-${car.version || "live"}`} car={car} admin={admin} onEdit={onEdit} />
      ))}
    </div>
  );
}
