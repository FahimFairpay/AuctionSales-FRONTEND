"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FacetValue } from "./fairentalApi";

export function FacetMenu({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: FacetValue[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const summary = selected.length === 0 ? "Any" : selected.length === 1 ? selected[0] : `${selected.length} selected`;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.value.toLowerCase().includes(q));
  }, [options, query]);

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
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between gap-2 rounded-[8px] border border-hairline bg-surface px-3 text-left text-sm text-ink hover:bg-surface-muted"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">
          <span className="text-muted">{label}</span>
          <span className="mx-1 text-muted">·</span>
          {summary}
        </span>
        <Chevron />
      </button>
      {open ? (
        <div className="absolute left-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-[12px] border border-hairline bg-surface p-3 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">{label}</p>
            {selected.length > 0 ? (
              <button type="button" className="text-xs text-accent hover:underline" onClick={onClear}>
                Any
              </button>
            ) : null}
          </div>
          <input
            className="mt-2 h-9 w-full rounded-[8px] border border-hairline bg-canvas px-3 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${label.toLowerCase()}`}
            aria-label={`Search ${label}`}
          />
          <ul className="mt-2 max-h-64 overflow-auto" role="listbox" aria-multiselectable="true">
            {visible.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <li key={option.value}>
                  <label className="flex min-w-0 cursor-pointer items-center gap-3 rounded-[8px] px-2 py-2 text-sm hover:bg-surface-muted">
                    <input type="checkbox" checked={checked} onChange={() => onToggle(option.value)} />
                    <span className="min-w-0 flex-1 truncate">{option.value}</span>
                    <span className="text-xs text-muted tabular">{option.count}</span>
                  </label>
                </li>
              );
            })}
            {visible.length === 0 ? <li className="px-2 py-3 text-xs text-muted">No matches.</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
