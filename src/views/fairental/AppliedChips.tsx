"use client";

import type { FairentalFilters } from "./filters";

export function AppliedChips({
  filters,
  onChange,
}: {
  filters: FairentalFilters;
  onChange: (next: FairentalFilters) => void;
}) {
  const chips = [
    ...filters.makes.map((value) => ({ label: value, clear: () => onChange({ ...filters, makes: filters.makes.filter((item) => item !== value), models: [] }) })),
    ...filters.models.map((value) => ({ label: value, clear: () => onChange({ ...filters, models: filters.models.filter((item) => item !== value) }) })),
    ...filters.bodies.map((value) => ({ label: value, clear: () => onChange({ ...filters, bodies: filters.bodies.filter((item) => item !== value) }) })),
    ...filters.exteriors.map((value) => ({ label: value, clear: () => onChange({ ...filters, exteriors: filters.exteriors.filter((item) => item !== value) }) })),
    ...filters.interiors.map((value) => ({ label: `Interior ${value}`, clear: () => onChange({ ...filters, interiors: filters.interiors.filter((item) => item !== value) }) })),
    filters.priceMin || filters.priceMax ? { label: `$${filters.priceMin || "0"}–$${filters.priceMax || "any"}`, clear: () => onChange({ ...filters, priceMin: "", priceMax: "" }) } : null,
    filters.yearMin || filters.yearMax ? { label: `${filters.yearMin || "…"}–${filters.yearMax || "…"}`, clear: () => onChange({ ...filters, yearMin: "", yearMax: "" }) } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.clear}
          className="rounded-full border border-[var(--fs-line)] bg-[var(--fs-paper-elevated)] px-3 py-1 text-[12px] text-[var(--fs-ink)]"
        >
          {chip.label} <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  );
}
