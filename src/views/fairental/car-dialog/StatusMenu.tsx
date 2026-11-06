"use client";

import { useEffect, useRef, useState } from "react";
import { STATUS_OPTIONS, type CarStatus } from "./form";

export function StatusMenu({
  value,
  disabled,
  onChange,
}: {
  value: CarStatus;
  disabled?: boolean;
  onChange: (next: CarStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const label = STATUS_OPTIONS.find((option) => option.id === value)?.label || "Listed";

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      <span className="block text-sm font-medium text-ink">Status</span>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-label="Status"
        className="flex h-10 w-full min-w-0 items-center justify-between rounded-[8px] border border-hairline bg-surface px-3 text-left text-sm text-ink hover:bg-surface-muted disabled:opacity-60"
        onClick={() => setOpen((current) => !current)}
      >
        {label}
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className={`absolute left-0 top-full z-20 mt-1 w-40 origin-top rounded-[12px] border border-hairline bg-surface p-1 shadow-lg transition duration-150 ease-out ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
      >
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm ${option.id === value ? "bg-surface-muted text-ink" : "text-ink hover:bg-surface-muted"}`}
            onClick={() => {
              setOpen(false);
              if (option.id !== value) onChange(option.id);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
