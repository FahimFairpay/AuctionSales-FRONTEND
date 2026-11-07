"use client";

import { useState } from "react";
import { CarDialog } from "./CarDialog";
import { FairentalBrowse } from "./FairentalBrowse";
import type { FairentalCard } from "./fairentalApi";

type Open = { kind: "create" } | { kind: "edit"; car: FairentalCard } | null;

export function AdminFairentalPage() {
  const [open, setOpen] = useState<Open>(null);
  const [stamp, setStamp] = useState(0);
  return (
    <div key={stamp}>
      <FairentalBrowse admin onCreate={() => setOpen({ kind: "create" })} onEdit={(car) => setOpen({ kind: "edit", car })} />
      {open ? (
        <CarDialog
          kind={open.kind}
          vin={open.kind === "edit" ? open.car.vin : undefined}
          seed={open.kind === "edit" ? open.car : undefined}
          onClose={() => setOpen(null)}
          onSaved={() => {
            setOpen(null);
            setStamp((value) => value + 1);
          }}
        />
      ) : null}
    </div>
  );
}
