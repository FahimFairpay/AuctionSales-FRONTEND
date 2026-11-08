"use client";

import { EmptyState } from "@/components/EmptyState";
import type { FairentalCard } from "./fairentalApi";
import type { PhotoUploadProgress } from "./photoUploadQueue";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({
  cars,
  admin,
  onEdit,
  onToggleListed,
  loading,
  uploads,
}: {
  cars: FairentalCard[];
  admin?: boolean;
  onEdit?: (car: FairentalCard) => void;
  onToggleListed?: (car: FairentalCard) => void;
  loading?: boolean;
  uploads?: PhotoUploadProgress[];
}) {
  if (!loading && cars.length === 0) {
    return <EmptyState>No cars match these filters.</EmptyState>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cars.map((car) => (
        <VehicleCard
          key={`${car.vin}-${car.version || "live"}`}
          car={car}
          admin={admin}
          onEdit={onEdit}
          onToggleListed={onToggleListed}
          upload={uploads?.find((row) => row.vin === car.vin && row.version === (car.version || row.version))}
        />
      ))}
    </div>
  );
}
