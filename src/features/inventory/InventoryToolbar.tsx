"use client";

import { IconTool } from "../../components/IconTool";
import { Input } from "../../components/Input";
import { useToast } from "../../components/Toast";
import type { RecipeFilters } from "../../types/filters";
import { InventoryFilterPill } from "./InventoryFilters";
import { inventoryFacetCount, type InventoryQuery } from "./query";

export function HeartCheckbox({
  checked,
  count,
  onChange,
}: {
  checked: boolean;
  count: number;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-[8px] border transition-all ${
        checked
          ? "border-[#c4673a] bg-[#c4673a]/15 text-[#c4673a] ring-1 ring-[#c4673a]"
          : "border-hairline bg-surface text-muted hover:bg-surface-muted hover:text-ink hover:border-hairline-strong"
      }`}
      aria-label={checked ? "Show all vehicles" : "Filter interested vehicles"}
      title={checked ? "Interested vehicles active (click to show all)" : "Filter interested vehicles"}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition-transform duration-150 ${
          checked ? "fill-[#c4673a] scale-110" : "fill-none stroke-current"
        }`}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 ? (
        <span
          className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold tabular ${
            checked
              ? "bg-[#c4673a] text-white"
              : "bg-surface-muted text-muted border border-hairline"
          }`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function InventoryToolbar({
  search,
  onSearch,
  recipe,
  query,
  onChange,
  onCustomize,
  onSave,
  onLoad,
  onlyInterested,
  onToggleInterested,
  interestedCount,
}: {
  search: string;
  onSearch: (value: string) => void;
  recipe?: RecipeFilters;
  query: InventoryQuery;
  onChange: (next: InventoryQuery) => void;
  onCustomize: () => void;
  onSave: () => void;
  onLoad: () => void;
  onlyInterested?: boolean;
  onToggleInterested?: () => void;
  interestedCount?: number;
}) {
  const { pushToast } = useToast();
  const hasFilters = inventoryFacetCount(query) > 0;

  function handleSave() {
    if (!hasFilters) {
      pushToast("Apply at least one filter before saving a preset.", "error");
      return;
    }
    onSave();
  }

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full">
      {/* 1. DYNAMIC SEARCH BOX ON LEFT (stretches to fill remaining space) */}
      <label className="relative flex-1 min-w-[200px] w-full sm:w-auto">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16.2 16.2 21 21" strokeLinecap="round" />
          </svg>
        </span>
        <Input
          className="h-9 w-full pl-9 text-sm"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search model or title"
          aria-label="Search model or title"
        />
      </label>

      {/* Filters, interested, and list tools. Auction house lives in the filter sheet. */}
      <div className="flex items-center gap-2 shrink-0">

        {/* FILTERS */}
        {recipe ? <InventoryFilterPill recipe={recipe} query={query} onChange={onChange} /> : null}

        {/* HEART SHAPED CHECK BOX */}
        {onToggleInterested ? (
          <HeartCheckbox
            checked={Boolean(onlyInterested)}
            count={interestedCount ?? 0}
            onChange={onToggleInterested}
          />
        ) : null}

        {/* CUSTOMIZE | SAVE | LOAD SVGs */}
        <div className="flex items-center gap-1">
          <IconTool label="Customize list" onClick={onCustomize}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h10M4 17h7" strokeLinecap="round" />
              <rect x="16" y="10" width="4" height="4" rx="1" />
              <rect x="13" y="15" width="4" height="4" rx="1" />
            </svg>
          </IconTool>
          <IconTool label="Save as preset" onClick={handleSave}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 3h14v18l-7-4-7 4V3z" strokeLinejoin="round" />
            </svg>
          </IconTool>
          <IconTool label="Apply preset" onClick={onLoad}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 16l-4-4h3V5h2v7h3l-4 4z" strokeLinejoin="round" />
              <path d="M5 19h14" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
      </div>
    </div>
  );
}
