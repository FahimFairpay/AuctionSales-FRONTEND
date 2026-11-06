"use client";

import type { FairentalFacets } from "./fairentalApi";
import { toggleValue, type FairentalFilters } from "./filters";
import { COLOR_SWATCHES, glass, swatchHex } from "./swatches";

const SORTS: [string, string][] = [
  ["newest", "Newest"],
  ["priceAsc", "Price, low to high"],
  ["priceDesc", "Price, high to low"],
  ["yearDesc", "Year, newest"],
  ["yearAsc", "Year, oldest"],
];

export function FilterPanel({
  filters,
  facets,
  query,
  onQuery,
  onChange,
  onClear,
  admin,
}: {
  filters: FairentalFilters;
  facets: FairentalFacets | null;
  query: string;
  onQuery: (value: string) => void;
  onChange: (next: FairentalFilters) => void;
  onClear: () => void;
  admin?: boolean;
}) {
  return (
    <aside className={`${glass} w-full rounded-[28px] p-4 lg:w-[292px] lg:shrink-0`}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--fs-muted)]">Showroom</p>
        <button type="button" onClick={onClear} className="text-[12px] text-[var(--fs-claude-orange)]">
          Reset
        </button>
      </div>
      <input
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        placeholder="Search title, make, VIN"
        className="mb-4 w-full rounded-2xl border border-[var(--fs-line)] bg-[var(--fs-paper)] px-3 py-2 text-[14px] text-[var(--fs-ink)] outline-none"
      />
      <label className="mb-4 block text-[12px] text-[var(--fs-muted)]">
        Sort
        <select
          value={filters.sort}
          onChange={(event) => onChange({ ...filters, sort: event.target.value })}
          className="mt-1 w-full rounded-2xl border border-[var(--fs-line)] bg-[var(--fs-paper)] px-3 py-2 text-[14px] text-[var(--fs-ink)]"
        >
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <Range
        label="Price"
        min={filters.priceMin}
        max={filters.priceMax}
        onMin={(priceMin) => onChange({ ...filters, priceMin })}
        onMax={(priceMax) => onChange({ ...filters, priceMax })}
      />
      <Range
        label="Year"
        min={filters.yearMin}
        max={filters.yearMax}
        onMin={(yearMin) => onChange({ ...filters, yearMin })}
        onMax={(yearMax) => onChange({ ...filters, yearMax })}
      />
      <Choices
        label="Make"
        options={facets?.makes || []}
        selected={filters.makes}
        onToggle={(value) => onChange({ ...filters, makes: toggleValue(filters.makes, value, 5), models: [] })}
      />
      {filters.makes.length ? (
        <Choices
          label="Model"
          options={facets?.models || []}
          selected={filters.models}
          onToggle={(value) => onChange({ ...filters, models: toggleValue(filters.models, value) })}
        />
      ) : null}
      <Choices
        label="Body style"
        options={facets?.bodyStyles || []}
        selected={filters.bodies}
        onToggle={(value) => onChange({ ...filters, bodies: toggleValue(filters.bodies, value) })}
      />
      <Swatches
        label="Exterior"
        selected={filters.exteriors}
        counts={facets?.exteriorColors || []}
        onToggle={(value) => onChange({ ...filters, exteriors: toggleValue(filters.exteriors, value) })}
      />
      <Swatches
        label="Interior"
        selected={filters.interiors}
        counts={facets?.interiorColors || []}
        onToggle={(value) => onChange({ ...filters, interiors: toggleValue(filters.interiors, value) })}
      />
      {admin ? (
        <label className="mt-3 flex items-center gap-2 text-[13px] text-[var(--fs-ink)]">
          <input
            type="checkbox"
            checked={filters.includeHidden}
            onChange={(event) => onChange({ ...filters, includeHidden: event.target.checked })}
          />
          Include sold and unlisted
        </label>
      ) : null}
    </aside>
  );
}

function Range({ label, min, max, onMin, onMax }: { label: string; min: string; max: string; onMin: (value: string) => void; onMax: (value: string) => void }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-[12px] text-[var(--fs-muted)]">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <input value={min} onChange={(event) => onMin(event.target.value.replace(/[^\d]/g, ""))} placeholder="Min" className="rounded-xl border border-[var(--fs-line)] bg-[var(--fs-paper)] px-2 py-1.5 text-[13px]" />
        <input value={max} onChange={(event) => onMax(event.target.value.replace(/[^\d]/g, ""))} placeholder="Max" className="rounded-xl border border-[var(--fs-line)] bg-[var(--fs-paper)] px-2 py-1.5 text-[13px]" />
      </div>
    </div>
  );
}

function Choices({ label, options, selected, onToggle }: { label: string; options: { value: string; count: number }[]; selected: string[]; onToggle: (value: string) => void }) {
  if (!options.length) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-[12px] text-[var(--fs-muted)]">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const on = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-full px-2.5 py-1 text-[12px] ${on ? "bg-[var(--fs-claude-orange)] text-white" : "bg-[var(--fs-paper)] text-[var(--fs-ink)]"}`}
            >
              {option.value} {option.count}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Swatches({ label, selected, counts, onToggle }: { label: string; selected: string[]; counts: { value: string; count: number }[]; onToggle: (value: string) => void }) {
  const known = new Map(counts.map((row) => [row.value.toLowerCase(), row]));
  return (
    <div className="mb-4">
      <p className="mb-2 text-[12px] text-[var(--fs-muted)]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {COLOR_SWATCHES.map((swatch) => {
          const hit = known.get(swatch.name.toLowerCase());
          const on = selected.some((value) => value.toLowerCase() === swatch.name.toLowerCase());
          return (
            <button
              key={swatch.name}
              type="button"
              title={hit ? `${swatch.name} ${hit.count}` : swatch.name}
              onClick={() => onToggle(hit?.value || swatch.name)}
              className={`h-7 w-7 rounded-full border ${on ? "ring-2 ring-[var(--fs-claude-orange)] ring-offset-2" : "border-[var(--fs-line)]"}`}
              style={{ background: swatchHex(swatch.name) }}
            />
          );
        })}
      </div>
    </div>
  );
}
