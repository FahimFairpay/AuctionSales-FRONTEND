"use client";

import { useNavigate } from "@/compat/router";
import { Button } from "../../components/Button";
import { RangeSlider } from "../../components/RangeSlider";
import { formatWhen } from "../../date/chicago";
import { IAAI_OPTIONS, IAAI_RANGE_BOUNDS, fmtRange } from "../../features/scrape/iaaiOptions";
import type { RecipeFormState } from "../../features/watchlists/formState";
import { paths } from "../../routes/paths";
import type { PublicRecipe } from "../../types/api";
import { RECIPE_BOOL_KEYS, RECIPE_LABELS, type RecipeListKey, type RecipeRangeKey } from "../../types/filters";

export type Step = 1 | 2 | 3 | 4 | 5 | 6;
export const TOTAL = 6;

export const STEPS: Array<{ id: Step; title: string; subtitle: string; keys: RecipeListKey[]; rangeKeys?: RecipeRangeKey[] }> = [
  { id: 1, title: "Vehicle & Type",  subtitle: "Types, sub-types and ranges",   keys: ["vehicleTypes", "vehicleSubTypes"],           rangeKeys: ["year", "odometer"] },
  { id: 2, title: "Condition",        subtitle: "Damage, title and start code",  keys: ["startCodes", "airbags", "primaryDamages", "lossTypes", "titleSaleDocs"], rangeKeys: ["vehicleScore"] },
  { id: 3, title: "Mechanics",        subtitle: "Fuel, gearbox and drivetrain",  keys: ["fuelTypes", "cylinders", "transmissions", "drivelineTypes"], rangeKeys: [] },
  { id: 4, title: "Style & Origin",   subtitle: "Body, colour and country",      keys: ["bodyStyles", "exteriorColors", "interiorColors", "countryOfOrigin"], rangeKeys: [] },
  { id: 5, title: "Sale & Audience",  subtitle: "Listing type, buyers, regions", keys: ["featuredAuctions", "whoCanBuy", "regions"],  rangeKeys: ["buyNowPrice"] },
  { id: 6, title: "Review",           subtitle: "Confirm and save",              keys: [], rangeKeys: [] },
];

export const REVIEW_GROUPS: Array<{ label: string; editStep: Step; lists: RecipeListKey[]; ranges: RecipeRangeKey[] }> = [
  { label: "Vehicle & Type",  editStep: 1, lists: ["vehicleTypes","vehicleSubTypes"] as RecipeListKey[], ranges: ["year","odometer"] as RecipeRangeKey[] },
  { label: "Condition",       editStep: 2, lists: ["startCodes","airbags","primaryDamages","lossTypes","titleSaleDocs"] as RecipeListKey[], ranges: ["vehicleScore"] as RecipeRangeKey[] },
  { label: "Mechanics",       editStep: 3, lists: ["fuelTypes","cylinders","transmissions","drivelineTypes"] as RecipeListKey[], ranges: [] as RecipeRangeKey[] },
  { label: "Style & Origin",  editStep: 4, lists: ["bodyStyles","exteriorColors","interiorColors","countryOfOrigin"] as RecipeListKey[], ranges: [] as RecipeRangeKey[] },
  { label: "Sale & Audience", editStep: 5, lists: ["featuredAuctions","whoCanBuy","regions"] as RecipeListKey[], ranges: ["buyNowPrice"] as RecipeRangeKey[] },
];

export function stepSelectionCount(s: typeof STEPS[number], state: RecipeFormState): number {
  let n = 0;
  if (s.id === 5) { for (const k of RECIPE_BOOL_KEYS) { if (state[k]) n++; } }
  for (const k of s.keys) { n += ((state[k] as string[]) || []).length; }
  for (const k of s.rangeKeys ?? []) {
    const d = state[k] as { min: string; max: string };
    if (d.min || d.max) n++;
  }
  return n;
}

function toggle(key: RecipeListKey, opt: string, state: RecipeFormState, patch: (n: Partial<RecipeFormState>) => void) {
  const cur = (state[key] as string[]) || [];
  patch({ [key]: cur.includes(opt) ? cur.filter((v) => v !== opt) : [...cur, opt] });
}

const pillBase = "inline-flex h-8 items-center rounded-full border px-3 text-[13px] font-medium transition-all duration-[120ms] select-none";
export const pillIdle = `${pillBase} border-hairline/60 bg-surface-muted/40 text-muted hover:text-ink hover:border-hairline hover:bg-surface-muted/70 backdrop-blur-sm`;
export const pillActive = `${pillBase} border-accent/70 bg-accent/10 text-accent shadow-[0_0_8px_0_rgba(var(--tw-shadow-color,217_119_87),.25)] backdrop-blur-sm`;

export function PillGroup({ optionKey, state, patch }: {
  optionKey: RecipeListKey;
  state: RecipeFormState;
  patch: (n: Partial<RecipeFormState>) => void;
}) {
  const options = IAAI_OPTIONS[optionKey] || [];
  const selected = (state[optionKey] as string[]) || [];
  if (options.length === 0) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">{RECIPE_LABELS[optionKey]}</h3>
        <span className="shrink-0 text-[11px] text-muted">{selected.length > 0 ? `${selected.length} selected` : "Any"}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => toggle(optionKey, opt, state, patch)}
            className={selected.includes(opt) ? pillActive : pillIdle}>
            {opt}
          </button>
        ))}
      </div>
    </section>
  );
}

export function RangeGroup({ rangeKeys, state, patch }: {
  rangeKeys: RecipeRangeKey[];
  state: RecipeFormState;
  patch: (n: Partial<RecipeFormState>) => void;
}) {
  if (!rangeKeys.length) return null;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {rangeKeys.map((key) => {
        const draft = state[key] as { min: string; max: string };
        const b = IAAI_RANGE_BOUNDS[key] ?? { min: 0, max: 100, step: 1 };
        const lo = Math.max(b.min, Math.min(Number(draft.min) || b.min, b.max));
        const hi = Math.max(b.min, Math.min(Number(draft.max) || b.max, b.max));
        return (
          <section key={key} className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium text-ink">{RECIPE_LABELS[key]}</h3>
              <span className="shrink-0 text-[11px] text-muted">{fmtRange(key, lo)} – {fmtRange(key, hi)}</span>
            </div>
            <RangeSlider label={RECIPE_LABELS[key]} min={b.min} max={b.max} step={b.step} lo={lo} hi={hi}
              format={(v) => fmtRange(key, v)}
              onChange={({ lo: l, hi: h }) => patch({ [key]: { min: String(l), max: String(h) } })} />
          </section>
        );
      })}
    </div>
  );
}

export function ReviewPill({ text }: { text: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full border border-accent/50 bg-accent/10 px-2.5 text-[12px] font-medium text-accent backdrop-blur-sm">
      {text}
    </span>
  );
}

export function ReviewGroup({ label, editStep, lists, ranges, state, onEdit, readonly }: {
  label: string;
  editStep: Step;
  lists: RecipeListKey[];
  ranges: RecipeRangeKey[];
  state: RecipeFormState;
  onEdit?: (s: Step) => void;
  readonly?: boolean;
}) {
  const rows: Array<{ label: string; content: React.ReactNode }> = [];
  for (const key of lists) {
    const vals = (state[key] as string[]) || [];
    if (vals.length > 0) {
      rows.push({ label: RECIPE_LABELS[key], content: <div className="flex flex-wrap gap-1.5">{vals.map((v) => <ReviewPill key={v} text={v} />)}</div> });
    }
  }
  for (const key of ranges) {
    const d = state[key] as { min: string; max: string };
    const b = IAAI_RANGE_BOUNDS[key] ?? { min: 0, max: 100, step: 1 };
    if (d.min || d.max) {
      const lo = Number(d.min) || b.min;
      const hi = Number(d.max) || b.max;
      rows.push({ label: RECIPE_LABELS[key], content: <span className="text-sm text-ink">{fmtRange(key, lo)} – {fmtRange(key, hi)}</span> });
    }
  }
  if (rows.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-[8px] border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline bg-surface-muted px-4 py-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{label}</span>
        {!readonly && onEdit && (
          <button type="button" onClick={() => onEdit(editStep)} className="text-[11px] text-accent hover:underline">Edit →</button>
        )}
      </div>
      <div className="divide-y divide-hairline">
        {rows.map(({ label: rl, content }) => (
          <div key={rl} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-2.5">
            <span className="w-32 shrink-0 pt-0.5 text-xs text-muted">{rl}</span>
            <div className="min-w-0 flex-1">{content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Preview mode: read-only display of recipe ───────────────────────────────

export function RecipePreview({
  recipe,
  state,
  onEdit,
  onChangePinOpen,
  onLock,
}: {
  recipe: PublicRecipe;
  state: RecipeFormState;
  onEdit: () => void;
  onChangePinOpen: () => void;
  onLock: () => void;
}) {
  const navigate = useNavigate();
  const boolActive = RECIPE_BOOL_KEYS.filter((k) => state[k] as boolean);
  const isEmpty = boolActive.length === 0 && REVIEW_GROUPS.every((g) => {
    const hasLists = g.lists.some((k) => ((state[k] as string[]) || []).length > 0);
    const hasRanges = g.ranges.some((k) => { const d = state[k] as { min: string; max: string }; return d.min || d.max; });
    return !hasLists && !hasRanges;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" aria-label="Back" onClick={() => navigate(paths.adminScrapeRuns)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">Settings</h1>
            <p className="mt-0.5 text-sm text-muted">{recipe.recipeVersion || "—"} · updated {formatWhen(recipe.updatedAt)}</p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={onLock}>Lock</Button>
          <Button variant="secondary" onClick={onChangePinOpen}>Change PIN</Button>
          <Button onClick={onEdit}>Edit recipe</Button>
        </div>
      </div>

      {/* Recipe content — read-only */}
      <div className="space-y-4">
        {boolActive.length > 0 && (
          <div className="overflow-hidden rounded-[8px] border border-hairline bg-surface">
            <div className="border-b border-hairline bg-surface-muted px-4 py-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Quick conditions</span>
            </div>
            <div className="flex flex-wrap gap-2 px-4 py-3">
              {boolActive.map((k) => <ReviewPill key={k} text={RECIPE_LABELS[k]} />)}
            </div>
          </div>
        )}
        {REVIEW_GROUPS.map((g) => (
          <ReviewGroup key={g.label} label={g.label} editStep={g.editStep} lists={g.lists} ranges={g.ranges} state={state} readonly />
        ))}
        {isEmpty && (
          <div className="rounded-[8px] border border-hairline bg-surface p-6 text-center">
            <p className="text-sm text-muted">No filters set — all lots will be scraped.</p>
          </div>
        )}
      </div>
    </div>
  );
}
