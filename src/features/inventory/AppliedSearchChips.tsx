"use client";

import type { SmartIntentApplied } from "../../types/api";

type Chip = {
  key: keyof SmartIntentApplied;
  value?: string | number;
  label: string;
};

function pretty(value: string): string {
  if (value === "IAAI" || value === "COPART") return value;
  return value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function chipsFromApplied(applied: SmartIntentApplied): Chip[] {
  const chips: Chip[] = [];
  if (applied.source) chips.push({ key: "source", value: applied.source, label: applied.source });
  for (const make of applied.makes || []) chips.push({ key: "makes", value: make, label: pretty(make) });
  for (const fuel of applied.fuelTypes || []) chips.push({ key: "fuelTypes", value: fuel, label: fuel });
  for (const kind of applied.vehicleTypes || []) chips.push({ key: "vehicleTypes", value: kind, label: kind });
  for (const code of applied.startCodes || []) chips.push({ key: "startCodes", value: code, label: code });
  for (const damage of applied.primaryDamages || []) chips.push({ key: "primaryDamages", value: damage, label: damage });
  if (applied.branch) chips.push({ key: "branch", value: applied.branch, label: pretty(applied.branch) });
  if (applied.yearMin) {
    const same = !applied.yearMax || applied.yearMin === applied.yearMax;
    chips.push({ key: "yearMin", label: same ? String(applied.yearMin) : `${applied.yearMin}–${applied.yearMax}` });
  }
  if (applied.odoMax) chips.push({ key: "odoMax", label: `${applied.odoMax.toLocaleString("en-US")} mi` });
  if (applied.cleanTitleOnly) chips.push({ key: "cleanTitleOnly", label: "Clean title" });
  if (applied.modelContains) chips.push({ key: "modelContains", value: applied.modelContains, label: pretty(applied.modelContains) });
  return chips;
}

export function AppliedSearchChips({
  applied,
  onRemove,
}: {
  applied: SmartIntentApplied;
  onRemove?: (key: keyof SmartIntentApplied, value?: string | number) => void;
}) {
  const chips = chipsFromApplied(applied);
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <span
          key={`${String(chip.key)}-${chip.label}`}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-hairline bg-surface px-2.5 text-[13px] text-ink"
        >
          {chip.label}
          {onRemove ? (
            <button
              type="button"
              className="text-muted hover:text-ink"
              aria-label={`Remove ${chip.label}`}
              onClick={() => onRemove(chip.key, chip.value)}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </span>
      ))}
    </div>
  );
}
