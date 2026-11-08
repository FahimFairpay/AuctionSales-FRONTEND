"use client";

import { useState } from "react";
import { CarDialog, type SavedCar } from "./CarDialog";
import { FairentalBrowse } from "./FairentalBrowse";
import type { FairentalCard } from "./fairentalApi";
import { usePhotoUploadQueue } from "./photoUploadQueue";

type Open = { kind: "create" } | { kind: "edit"; car: FairentalCard } | null;

export function AdminFairentalPage() {
  const [open, setOpen] = useState<Open>(null);
  const [stamp, setStamp] = useState(0);
  const { progress, enqueue } = usePhotoUploadQueue();

  function saved(row: SavedCar) {
    enqueue(row.vin, row.version, row.files);
    setOpen(null);
    setStamp((value) => value + 1);
  }

  return (
    <div key={stamp}>
      <FairentalBrowse
        admin
        uploads={progress}
        onCreate={() => setOpen({ kind: "create" })}
        onEdit={(car) => setOpen({ kind: "edit", car })}
      />
      {open ? (
        <CarDialog
          kind={open.kind}
          vin={open.kind === "edit" ? open.car.vin : undefined}
          seed={open.kind === "edit" ? open.car : undefined}
          onClose={() => setOpen(null)}
          onSaved={saved}
        />
      ) : null}
    </div>
  );
}
