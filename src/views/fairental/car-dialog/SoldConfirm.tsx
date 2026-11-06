"use client";

import { Button } from "@/components/Button";

export function SoldConfirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-scrim p-4" role="presentation">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sold-confirm-title"
        className="w-full max-w-sm rounded-[12px] border border-hairline bg-surface p-4 shadow-lg"
      >
        <h3 id="sold-confirm-title" className="font-serif text-lg text-ink">Mark this car sold?</h3>
        <p className="mt-2 text-sm text-muted">A sold car cannot be listed or edited again. This cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm sold</Button>
        </div>
      </div>
    </div>
  );
}
