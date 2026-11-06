"use client";

import { useState } from "react";
import { CarDialog } from "./CarDialog";
import { FairentalBrowse } from "./FairentalBrowse";

type Open = { kind: "create" } | { kind: "edit"; vin: string } | null;

export function AdminFairentalPage() {
  const [open, setOpen] = useState<Open>(null);
  const [stamp, setStamp] = useState(0);
  return (
    <div key={stamp}>
      <FairentalBrowse admin onCreate={() => setOpen({ kind: "create" })} onEdit={(vin) => setOpen({ kind: "edit", vin })} />
      {open ? (
        <CarDialog
          kind={open.kind}
          vin={"vin" in open ? open.vin : undefined}
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
