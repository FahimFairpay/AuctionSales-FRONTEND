"use client";

import type { ReactNode } from "react";

export function FilterSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close filters" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[28px] bg-[var(--fs-paper)] p-4">
        {children}
      </div>
    </div>
  );
}
