"use client";

import { useEffect, useRef, useState } from "react";
import { IconTool } from "../../components/IconTool";
import { RangeSlider } from "../../components/RangeSlider";
import { RECIPE_LABELS, type RecipeFilters, type RecipeListKey } from "../../types/filters";
import {
  formatRangeValue,
  patchRange,
  recipeRangeBounds,
  sliderPair,
  type RangeKind,
} from "./rangeBounds";
import {
  defaultInventoryQuery,
  inventoryFacetCount,
  listFiltersFromRecipe,
  type InventoryQuery,
} from "./query";
import { ProviderChoice } from "./SourceGlassPill";

const RANGE_SPECS: Array<{ kind: RangeKind; label: string; step: number }> = [
  { kind: "year", label: "Year", step: 1 },
  { kind: "odo", label: "Odometer", step: 500 },
  { kind: "score", label: "Score", step: 1 },
];

const activePill =
  "inline-flex h-8 items-center rounded-full border border-accent/70 bg-accent/10 px-3 text-[13px] font-medium text-accent backdrop-blur-sm shadow-[0_0_8px_0_rgba(217,119,87,.25)] transition-all duration-[120ms] select-none";
const idlePill =
  "inline-flex h-8 items-center rounded-full border border-hairline/60 bg-surface-muted/40 px-3 text-[13px] font-medium text-muted backdrop-blur-sm hover:text-ink hover:border-hairline hover:bg-surface-muted/70 transition-all duration-[120ms] select-none";

export function InventoryFilterPill({
  recipe,
  query,
  onChange,
}: {
  recipe: RecipeFilters;
  query: InventoryQuery;
  onChange: (next: InventoryQuery) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const listKeys = listFiltersFromRecipe(recipe);
  const count = inventoryFacetCount(query);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus(); };
  }, [open]);

  function clearAll() {
    onChange({ ...defaultInventoryQuery(), limit: query.limit, modelContains: query.modelContains });
  }

  if (!open) {
    return (
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 text-muted hover:bg-surface-muted hover:text-ink"
        aria-label="Filters"
        onClick={() => setOpen(true)}
      >
        <FunnelGlyph />
        {count > 0 ? (
          <span className="min-w-[1.1rem] rounded-full bg-accent px-1 text-center text-[10px] font-medium text-canvas tabular">
            {count}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <>
      {/* Pill trigger while open */}
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-accent bg-accent px-2.5 text-canvas"
        aria-label="Filters"
        onClick={() => setOpen(false)}
      >
        <FunnelGlyph />
        {count > 0 ? (
          <span className="min-w-[1.1rem] rounded-full bg-canvas/20 px-1 text-center text-[10px] font-medium text-canvas tabular">
            {count}
          </span>
        ) : null}
      </button>

      {/* Overlay scrim */}
      <div
        className="fixed inset-0 z-40 bg-scrim backdrop-blur-[8px]"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      {/* Panel — bottom sheet on mobile, centred card on lg+ */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        className={[
          "fixed z-50 bg-surface shadow-2xl",
          // Mobile: full-width bottom sheet, scrollable content
          "bottom-0 left-0 right-0 max-h-[90dvh] overflow-y-auto rounded-t-[16px] p-5 pb-safe",
          // Desktop: centred card, no scroll
          "lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:max-h-[calc(100dvh-4rem)]",
          "lg:-translate-x-1/2 lg:-translate-y-1/2 lg:overflow-y-auto",
          "lg:w-full lg:max-w-3xl lg:rounded-[12px] lg:border lg:border-hairline lg:p-6",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile only) */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline lg:hidden" aria-hidden="true" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="filter-modal-title" className="font-serif text-xl text-ink">Filters</h2>
            <p className="mt-0.5 text-sm text-muted">Narrow the inventory to matching lots.</p>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 ? (
              <button
                type="button"
                className="inline-flex h-8 items-center rounded-[8px] border border-hairline px-2.5 text-xs text-ink hover:bg-surface-muted"
                onClick={clearAll}
              >
                Clear all
              </button>
            ) : null}
            <IconTool label="Close" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </IconTool>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-ink">Provider</p>
          <ProviderChoice
            includeAll
            value={query.source}
            onChange={(next) => onChange({ ...query, source: next, cursor: undefined })}
          />
        </div>

        {/* List facets — glassy pills */}
        {listKeys.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-6">
            {listKeys.map((key: RecipeListKey) => {
              const isPrimaryDamage = key === "primaryDamages";
              const options = (recipe[key] || []) as string[];
              const selected = (query[key] || []) as string[];
              return (
                <div key={key} className={isPrimaryDamage ? "w-full" : "min-w-[9rem] flex-1"}>
                  <p className="mb-2 text-xs font-medium text-ink">
                    {RECIPE_LABELS[key]}
                    {selected.length > 0 ? (
                      <span className="ml-1.5 rounded-full bg-accent px-1 text-[10px] font-medium text-canvas tabular">
                        {selected.length}
                      </span>
                    ) : null}
                  </p>
                  <div className={isPrimaryDamage ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
                    {options.map((option) => {
                      const active = selected.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            const current = query[key] || [];
                            onChange({
                              ...query,
                              [key]: current.includes(option)
                                ? current.filter((v) => v !== option)
                                : [...current, option],
                            });
                          }}
                          className={active ? activePill : idlePill}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Range sliders */}
        <div className={`flex flex-wrap gap-6 ${listKeys.length > 0 ? "mt-5 border-t border-hairline pt-5" : "mt-5"}`}>
          {RANGE_SPECS.map((spec) => {
            const bounds = recipeRangeBounds(recipe, spec.kind);
            const pair = sliderPair(query, bounds, spec.kind);
            return (
              <div key={spec.kind} className="min-w-[11rem] flex-1 space-y-2">
                <p className="text-xs font-medium text-ink">{spec.label}</p>
                <RangeSlider
                  label={spec.label}
                  min={bounds.min}
                  max={bounds.max}
                  step={spec.step}
                  lo={pair.lo}
                  hi={pair.hi}
                  format={(value) => formatRangeValue(spec.kind, value)}
                  onChange={(next) => onChange(patchRange(query, bounds, spec.kind, next))}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function FunnelGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16l-6.2 7.4V19l-3.6 1.5v-8.1L4 5z" strokeLinejoin="round" />
    </svg>
  );
}
