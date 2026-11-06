"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { IconTool } from "@/components/IconTool";
import { Input } from "@/components/Input";
import type { FairentalFacets } from "./fairentalApi";
import {
  EMPTY_FILTERS,
  filterCount,
  SORT_OPTIONS,
  toggleValue,
  type FairentalFilters,
} from "./filters";

const activePill =
  "inline-flex h-8 items-center rounded-full border border-accent/70 bg-accent/10 px-3 text-[13px] font-medium text-accent";
const idlePill =
  "inline-flex h-8 items-center rounded-full border border-hairline/60 bg-surface-muted/40 px-3 text-[13px] font-medium text-muted hover:text-ink";

export function FairentalToolbar({
  filters,
  facets,
  search,
  onSearch,
  onChange,
  admin,
  onCreate,
}: {
  filters: FairentalFilters;
  facets: FairentalFacets | null;
  search: string;
  onSearch: (value: string) => void;
  onChange: (next: FairentalFilters) => void;
  admin?: boolean;
  onCreate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const count = filterCount(filters);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative min-w-[200px] flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4 4" strokeLinecap="round" />
          </svg>
        </span>
        <Input
          className="h-9 w-full pl-9 pr-8 text-sm"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search make, model, year, or VIN"
          aria-label="Search Fairental"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearch("")}
            className="absolute inset-y-0 right-2.5 flex items-center text-muted hover:text-ink"
            aria-label="Clear search text"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </label>
      <button
        type="button"
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 ${open ? "border-accent bg-accent text-canvas" : "border-hairline bg-surface text-muted hover:bg-surface-muted hover:text-ink"}`}
        aria-label="Filters"
        onClick={() => setOpen((current) => !current)}
      >
        <FunnelGlyph />
        {count > 0 ? (
          <span className={`min-w-[1.1rem] rounded-full px-1 text-center text-[10px] font-medium tabular ${open ? "bg-canvas/20 text-canvas" : "bg-accent text-canvas"}`}>
            {count}
          </span>
        ) : null}
      </button>
      <SortMenu value={filters.sort} onChange={(sort) => onChange({ ...filters, sort })} />
      {admin ? (
        <Button className="h-8" onClick={onCreate}>Add car</Button>
      ) : null}
      {open ? (
        <FilterDialog
          filters={filters}
          facets={facets}
          admin={admin}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function FilterDialog({
  filters,
  facets,
  admin,
  onChange,
  onClose,
}: {
  filters: FairentalFilters;
  facets: FairentalFacets | null;
  admin?: boolean;
  onChange: (next: FairentalFilters) => void;
  onClose: () => void;
}) {
  const count = filterCount(filters);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-scrim backdrop-blur-[8px]" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fairental-filter-title"
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-[16px] bg-surface p-5 shadow-2xl lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:max-h-[calc(100dvh-4rem)] lg:w-full lg:max-w-3xl lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[12px] lg:border lg:border-hairline lg:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline lg:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="fairental-filter-title" className="font-serif text-xl text-ink">Filters</h2>
            <p className="mt-0.5 text-sm text-muted">Narrow the cars on this page.</p>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 ? (
              <button
                type="button"
                className="inline-flex h-8 items-center rounded-[8px] border border-hairline px-2.5 text-xs text-ink hover:bg-surface-muted"
                onClick={() => onChange({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })}
              >
                Clear all
              </button>
            ) : null}
            <IconTool label="Close" onClick={onClose}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </IconTool>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Range label="Price" min={filters.priceMin} max={filters.priceMax} onMin={(priceMin) => onChange({ ...filters, priceMin })} onMax={(priceMax) => onChange({ ...filters, priceMax })} />
          <Range label="Year" min={filters.yearMin} max={filters.yearMax} onMin={(yearMin) => onChange({ ...filters, yearMin })} onMax={(yearMax) => onChange({ ...filters, yearMax })} />
          <Input
            value={filters.exteriors[0] || ""}
            placeholder="Exterior color"
            aria-label="Exterior color"
            onChange={(event) => onChange({ ...filters, exteriors: event.target.value ? [event.target.value] : [] })}
          />
          <Input
            value={filters.interiors[0] || ""}
            placeholder="Interior color"
            aria-label="Interior color"
            onChange={(event) => onChange({ ...filters, interiors: event.target.value ? [event.target.value] : [] })}
          />
        </div>
        <Pills
          label="Make"
          options={facets?.makes || []}
          selected={filters.makes}
          onToggle={(value) => onChange({ ...filters, makes: toggleValue(filters.makes, value, 5), models: [] })}
        />
        {filters.makes.length ? (
          <Pills
            label="Model"
            options={facets?.models || []}
            selected={filters.models}
            onToggle={(value) => onChange({ ...filters, models: toggleValue(filters.models, value) })}
          />
        ) : null}
        <Pills
          label="Body style"
          options={facets?.bodyStyles || []}
          selected={filters.bodies}
          onToggle={(value) => onChange({ ...filters, bodies: toggleValue(filters.bodies, value) })}
        />
        {admin ? (
          <label className="mt-5 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={filters.includeHidden}
              onChange={(event) => onChange({ ...filters, includeHidden: event.target.checked })}
            />
            Include sold and unlisted
          </label>
        ) : null}
      </div>
    </>
  );
}

function Range({
  label,
  min,
  max,
  onMin,
  onMax,
}: {
  label: string;
  min: string;
  max: string;
  onMin: (value: string) => void;
  onMax: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-ink">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <Input value={min} placeholder="Min" aria-label={`${label} minimum`} onChange={(event) => onMin(event.target.value.replace(/[^\d]/g, ""))} />
        <Input value={max} placeholder="Max" aria-label={`${label} maximum`} onChange={(event) => onMax(event.target.value.replace(/[^\d]/g, ""))} />
      </div>
    </div>
  );
}

function Pills({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; count: number }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (!options.length) return null;
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-medium text-ink">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={selected.includes(option.value) ? activePill : idlePill}
            onClick={() => onToggle(option.value)}
          >
            {option.value} {option.count}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortMenu({ value, onChange }: { value: string; onChange: (sort: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const label = SORT_OPTIONS.find(([id]) => id === value)?.[1] || "Newest";

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
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="inline-flex h-8 max-w-[11rem] items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 text-[13px] text-ink hover:bg-surface-muted"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{label}</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-[12px] border border-hairline bg-surface p-2 shadow-lg">
          {SORT_OPTIONS.map(([id, name]) => (
            <button
              key={id}
              type="button"
              className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm ${id === value ? "bg-surface-muted text-ink" : "text-ink hover:bg-surface-muted"}`}
              onClick={() => {
                onChange(id);
                setOpen(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FunnelGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16l-6 7v6l-4 2v-8L4 5z" strokeLinejoin="round" />
    </svg>
  );
}
