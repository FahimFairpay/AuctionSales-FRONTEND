"use client";

import { Button } from "../../components/Button";
import { Spinner } from "../../components/Spinner";
import type { CopartRecipeRules } from "../../types/api";

export const DEFAULT_COPART_RULES: CopartRecipeRules = {
  source: "COPART",
  min_year: 2020,
  max_odometer: 95000,
  sale_title_type: "CT",
  allowed_doc_types: ["CT", "CLEAN TITLE", "CLEAR"],
  has_keys: "YES",
  transmission: "AUTOMATIC",
  runs_drives: "Run & Drive Verified",
  fuel_types: ["GAS", "ELECTRIC AND GAS HYBRID", "ELECTRIC"],
  makes: [
    "NISSAN", "CHEVROLET", "TOYOTA", "TESLA", "HONDA", "KIA",
    "MERCEDES-BENZ", "VOLKSWAGEN", "BUICK", "BMW", "GMC", "FORD",
    "HYUNDAI", "ACURA", "RAM", "DODGE", "JEEP", "CADILLAC", "AUDI",
    "SUBARU", "MAZDA", "MITSUBISHI", "VOLVO", "INFINITI",
  ],
  primary_damages: [
    "FRONT END", "MINOR DENT/SCRATCHES", "NORMAL WEAR",
    "SIDE", "REAR END", "HAIL", "FRAME DAMAGE",
  ],
};

function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function coerceCopartRules(raw: Partial<CopartRecipeRules> | null | undefined): CopartRecipeRules {
  const legacy = (raw || {}) as Record<string, unknown>;
  return {
    ...DEFAULT_COPART_RULES,
    ...(raw || {}),
    min_year: Number(legacy.min_year ?? legacy.yearMin ?? DEFAULT_COPART_RULES.min_year),
    max_odometer: Number(legacy.max_odometer ?? legacy.maxOdometer ?? DEFAULT_COPART_RULES.max_odometer),
    sale_title_type: String(legacy.sale_title_type ?? DEFAULT_COPART_RULES.sale_title_type),
    allowed_doc_types: asList(legacy.allowed_doc_types ?? legacy.allowedDocTypes ?? DEFAULT_COPART_RULES.allowed_doc_types),
    makes: asList(legacy.makes ?? DEFAULT_COPART_RULES.makes),
    primary_damages: asList(legacy.primary_damages ?? DEFAULT_COPART_RULES.primary_damages),
    fuel_types: asList(legacy.fuel_types ?? DEFAULT_COPART_RULES.fuel_types),
    source: "COPART",
  };
}

function csv(values: string[] | undefined): string {
  return (values || []).join(", ");
}

export function CopartRecipeEditor({
  rules,
  onChange,
  onSave,
  saving,
  pinReady,
}: {
  rules: CopartRecipeRules;
  onChange: (next: CopartRecipeRules) => void;
  onSave: () => void;
  saving: boolean;
  pinReady: boolean;
}) {
  return (
    <div className="space-y-6 rounded-[12px] border border-hairline bg-surface p-6 shadow-sm">
      <div className="border-b border-hairline pb-4">
        <h2 className="font-serif text-xl text-ink">Copart 13-rule pre-filter</h2>
        <p className="mt-1 text-xs text-muted">
          These keys are what the ECS filter reads: min year, odometer, title code, makes, damage, and fuel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block text-xs font-semibold text-muted">
          Minimum model year
          <input
            type="number"
            value={rules.min_year}
            onChange={(e) => onChange({ ...rules, min_year: Number(e.target.value) })}
            className="mt-1 h-9 w-full rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          Maximum odometer
          <input
            type="number"
            value={rules.max_odometer}
            onChange={(e) => onChange({ ...rules, max_odometer: Number(e.target.value) })}
            className="mt-1 h-9 w-full rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-muted">
          Sale title type
          <input
            value={rules.sale_title_type}
            onChange={(e) => onChange({ ...rules, sale_title_type: e.target.value.toUpperCase() })}
            className="mt-1 h-9 w-full rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-muted md:col-span-2">
          Allowed doc types
          <input
            value={csv(rules.allowed_doc_types)}
            onChange={(e) => onChange({ ...rules, allowed_doc_types: asList(e.target.value) })}
            className="mt-1 h-9 w-full rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-muted md:col-span-2">
          Makes
          <textarea
            value={csv(rules.makes)}
            onChange={(e) => onChange({ ...rules, makes: asList(e.target.value) })}
            className="mt-1 min-h-20 w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-muted md:col-span-2">
          Primary damages
          <textarea
            value={csv(rules.primary_damages)}
            onChange={(e) => onChange({ ...rules, primary_damages: asList(e.target.value) })}
            className="mt-1 min-h-16 w-full rounded-[6px] border border-hairline bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-muted md:col-span-2">
          Fuel types
          <input
            value={csv(rules.fuel_types)}
            onChange={(e) => onChange({ ...rules, fuel_types: asList(e.target.value) })}
            className="mt-1 h-9 w-full rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-hairline pt-4">
        <p className="text-xs text-muted">{pinReady ? "PIN from unlock will be sent with this save." : "Unlock the recipe with the PIN before saving."}</p>
        <Button onClick={onSave} disabled={saving || !pinReady}>
          {saving ? <Spinner /> : "Save Copart recipe"}
        </Button>
      </div>
    </div>
  );
}
