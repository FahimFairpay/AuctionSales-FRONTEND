"use client";

import { useEffect, useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ApiError } from "@/api/errors";
import { publicFairental, type FairentalDetail } from "./fairentalApi";
import { VehicleDetail } from "./VehicleDetail";

export function FairentalDetailPage({ vin }: { vin: string }) {
  const [car, setCar] = useState<FairentalDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let gone = false;
    publicFairental(vin)
      .then((row) => {
        if (!gone) setCar(row);
      })
      .catch((err: unknown) => {
        if (!gone) setError(err instanceof ApiError ? err.message : "This vehicle is not available");
      });
    return () => {
      gone = true;
    };
  }, [vin]);

  if (error) {
    return (
      <div className="fairautos-landing min-h-screen">
        <PublicHeader mode="inventory" />
        <p className="px-6 pt-32 text-[var(--fs-muted)]">{error}</p>
      </div>
    );
  }
  if (!car) {
    return (
      <div className="fairautos-landing min-h-screen">
        <PublicHeader mode="inventory" />
      </div>
    );
  }
  return <VehicleDetail car={car} />;
}
