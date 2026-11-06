"use client";

import { useEffect, useRef, useState } from "react";
import { IconTool } from "@/components/IconTool";
import { Input } from "@/components/Input";
import { RangeSlider } from "@/components/RangeSlider";
import type { FairentalFacets } from "./fairentalApi";
import { FacetMenu } from "./FacetMenu";
import {
  EMPTY_FILTERS,
  SORT_FIELDS,
  dollars,
  filterCount,
  nextSort,
  sortField,
  toggleValue,
  type FairentalFilters,
} from "./filters";

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
      <label className="relative min-w-0 flex-1 basis-[12rem]">
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
        className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${open ? "border-accent bg-accent text-canvas" : "border-hairline bg-surface text-muted hover:bg-surface-muted hover:text-ink"}`}
        aria-label={count > 0 ? `Filters, ${count} applied` : "Filters"}
        onClick={() => setOpen((current) => !current)}
      >
        <FunnelGlyph />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-canvas tabular">
            {count}
          </span>
        ) : null}
      </button>
      <SortMenu value={filters.sort} onChange={(sort) => onChange({ ...filters, sort })} />
      {admin ? (
        <>
          <button
            type="button"
            role="switch"
            aria-checked={filters.includeHidden}
            onClick={() => onChange({ ...filters, includeHidden: !filters.includeHidden })}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 text-xs text-ink hover:bg-surface-muted"
          >
            <span className={`relative inline-flex h-4 w-7 items-center rounded-full px-0.5 ${filters.includeHidden ? "bg-ink" : "bg-hairline"}`}>
              <span className={`h-3 w-3 rounded-full bg-surface shadow-sm transition-transform ${filters.includeHidden ? "translate-x-3" : "translate-x-0"}`} />
            </span>
            Sold and unlisted
          </button>
          <button
            type="button"
            onClick={onCreate}
            aria-label="Add car"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-ink hover:bg-surface-muted"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </>
      ) : null}
      {open ? (
        <FilterDialog
          filters={filters}
          facets={facets}
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
  onChange,
  onClose,
}: {
  filters: FairentalFilters;
  facets: FairentalFacets | null;
  onChange: (next: FairentalFilters) => void;
  onClose: () => void;
}) {
  const count = filterCount(filters);
  const year = rangeBounds(facets?.year, 1981, new Date().getFullYear() + 1);
  const price = rangeBounds(facets?.price, 1, 2_000_000);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-scrim backdrop-blur-[8px]" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fairental-filter-title"
        className="fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-1.5rem)] overflow-visible rounded-[16px] bg-surface p-4 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[12px] sm:border sm:border-hairline sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="fairental-filter-title" className="font-serif text-xl text-ink">Filters</h2>
            <p className="mt-0.5 text-sm text-muted">Narrow the cars on this page.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <FacetMenu
            label="Make"
            options={facets?.makes || []}
            selected={filters.makes}
            onToggle={(value) => onChange({ ...filters, makes: toggleValue(filters.makes, value, 5), models: [] })}
            onClear={() => onChange({ ...filters, makes: [], models: [] })}
          />
          {filters.makes.length ? (
            <FacetMenu
              label="Model"
              options={facets?.models || []}
              selected={filters.models}
              onToggle={(value) => onChange({ ...filters, models: toggleValue(filters.models, value) })}
              onClear={() => onChange({ ...filters, models: [] })}
            />
          ) : null}
          <FacetMenu
            label="Body style"
            options={facets?.bodyStyles || []}
            selected={filters.bodies}
            onToggle={(value) => onChange({ ...filters, bodies: toggleValue(filters.bodies, value) })}
            onClear={() => onChange({ ...filters, bodies: [] })}
          />
          <FacetMenu
            label="Exterior"
            options={facets?.exteriorColors || []}
            selected={filters.exteriors}
            onToggle={(value) => onChange({ ...filters, exteriors: toggleValue(filters.exteriors, value) })}
            onClear={() => onChange({ ...filters, exteriors: [] })}
          />
          <FacetMenu
            label="Interior"
            options={facets?.interiorColors || []}
            selected={filters.interiors}
            onToggle={(value) => onChange({ ...filters, interiors: toggleValue(filters.interiors, value) })}
            onClear={() => onChange({ ...filters, interiors: [] })}
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium text-ink">Price</p>
            <RangeSlider
              label="Price"
              min={price.min}
              max={price.max}
              step={price.max - price.min > 500 ? 100 : 1}
              lo={numberOr(filters.priceMin, price.min)}
              hi={numberOr(filters.priceMax, price.max)}
              format={dollars}
              onChange={(next) => onChange(writeRange(filters, "priceMin", "priceMax", next, price))}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-ink">Year</p>
            <RangeSlider
              label="Year"
              min={year.min}
              max={year.max}
              lo={numberOr(filters.yearMin, year.min)}
              hi={numberOr(filters.yearMax, year.max)}
              onChange={(next) => onChange(writeRange(filters, "yearMin", "yearMax", next, year))}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function rangeBounds(pair: { min: number; max: number } | undefined, fallbackMin: number, fallbackMax: number) {
  if (!pair || pair.min <= 0 || pair.max < pair.min) return { min: fallbackMin, max: fallbackMax };
  if (pair.min === pair.max) return { min: fallbackMin, max: Math.max(fallbackMax, pair.max) };
  return { min: pair.min, max: pair.max };
}

function numberOr(value: string, fallback: number) {
  const parsed = Number(value);
  return value && Number.isFinite(parsed) ? parsed : fallback;
}

function writeRange(
  filters: FairentalFilters,
  minKey: "priceMin" | "yearMin",
  maxKey: "priceMax" | "yearMax",
  next: { lo: number; hi: number },
  bounds: { min: number; max: number },
): FairentalFilters {
  return {
    ...filters,
    [minKey]: next.lo <= bounds.min ? "" : String(next.lo),
    [maxKey]: next.hi >= bounds.max ? "" : String(next.hi),
  };
}

function SortMenu({ value, onChange }: { value: string; onChange: (sort: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = sortField(value);
  const descending = value !== active.asc;

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
        className="inline-flex h-9 max-w-[11rem] items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 text-sm text-ink hover:bg-surface-muted"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{active.label}</span>
        <DirectionGlyph down={descending} />
      </button>
      <div
        className={`absolute right-0 z-20 mt-2 w-44 max-w-[calc(100vw-1.5rem)] origin-top-right rounded-[12px] border border-hairline bg-surface p-1 shadow-lg transition duration-150 ease-out ${open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
      >
        {SORT_FIELDS.map((field) => {
          const selected = field.id === active.id;
          const down = !selected || value === field.desc;
          return (
            <button
              key={field.id}
              type="button"
              className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-sm ${selected ? "bg-surface-muted text-ink" : "text-ink hover:bg-surface-muted"}`}
              onClick={() => {
                onChange(nextSort(value, field.id));
                setOpen(false);
              }}
            >
              {field.label}
              {selected ? <DirectionGlyph down={down} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DirectionGlyph({ down }: { down: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
      {down ? (
        <path d="M12 5v14M7 14l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M12 19V5M7 10l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function FunnelGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16l-6 7v6l-4 2v-8L4 5z" strokeLinejoin="round" />
    </svg>
  );
}
