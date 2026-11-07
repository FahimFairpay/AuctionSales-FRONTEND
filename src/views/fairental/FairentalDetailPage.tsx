"use client";

import { useEffect, useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ApiError } from "@/api/errors";
import { publicFairental, type FairentalDetail } from "./fairentalApi";
import { VehicleDetail } from "./VehicleDetail";
import { FairOrb } from "@/components/orb/FairOrb";

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
      <div className="flex min-h-dvh flex-col bg-canvas text-ink">
        <PublicHeader mode="inventory" />
        <p className="public-page-frame text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (!car) {
    return (
      <div className="flex min-h-dvh flex-col bg-canvas text-ink">
        <PublicHeader mode="inventory" />
        <div className="public-page-frame">
          <FairOrb state="working" />
        </div>
      </div>
    );
  }
  return <VehicleDetail car={car} />;
}
