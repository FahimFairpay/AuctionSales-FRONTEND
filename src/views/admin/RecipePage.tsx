"use client";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@/compat/router";
import { unlockAdminRecipe } from "../../api/scrape";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { PinBoxInput } from "../../components/PinBoxInput";
import { RangeSlider } from "../../components/RangeSlider";
import { Spinner } from "../../components/Spinner";
import { formatWhen } from "../../date/chicago";
import { RecipeSaveModal } from "../../features/scrape/RecipeSaveModal";
import { RecipePinChangeModal } from "../../features/scrape/RecipePinChangeModal";
import { serializeCatalog } from "../../features/scrape/RecipeEditor";
import { IAAI_OPTIONS, IAAI_RANGE_BOUNDS, fmtRange } from "../../features/scrape/iaaiOptions";
import { hydrateFormState, type RecipeFormState } from "../../features/watchlists/formState";
import { paths } from "../../routes/paths";
import type { CopartRecipeRules, PublicRecipe } from "../../types/api";
import { RECIPE_BOOL_KEYS, RECIPE_LABELS, type RecipeListKey, type RecipeRangeKey } from "../../types/filters";

const DEFAULT_COPART_RULES: CopartRecipeRules = {
  source: "COPART",
  yearMin: 2018,
  maxOdometer: 85000,
  allowedDocTypes: ["CT", "CLEAN TITLE", "CLEAR"],
  prohibitedDamageTypes: ["WATER/FLOOD", "BIOHAZARD/CHEMICAL", "STRIPPED", "BURN"],
  cleanTitleOnly: true,
  requiresRunsDrives: true,
  requiresKeys: true,
  prohibitedFuelTypes: ["COMPRESSED NATURAL GAS", "PROPANE GAS"],
  prohibitedBodyStyles: ["COMMERCIAL TRUCK", "BUS", "TRAILER"],
};

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL = 6;

const STEPS: Array<{ id: Step; title: string; subtitle: string; keys: RecipeListKey[]; rangeKeys?: RecipeRangeKey[] }> = [
  { id: 1, title: "Vehicle & Type",  subtitle: "Types, sub-types and ranges",   keys: ["vehicleTypes", "vehicleSubTypes"],           rangeKeys: ["year", "odometer"] },
  { id: 2, title: "Condition",        subtitle: "Damage, title and start code",  keys: ["startCodes", "airbags", "primaryDamages", "lossTypes", "titleSaleDocs"], rangeKeys: ["vehicleScore"] },
  { id: 3, title: "Mechanics",        subtitle: "Fuel, gearbox and drivetrain",  keys: ["fuelTypes", "cylinders", "transmissions", "drivelineTypes"], rangeKeys: [] },
  { id: 4, title: "Style & Origin",   subtitle: "Body, colour and country",      keys: ["bodyStyles", "exteriorColors", "interiorColors", "countryOfOrigin"], rangeKeys: [] },
  { id: 5, title: "Sale & Audience",  subtitle: "Listing type, buyers, regions", keys: ["featuredAuctions", "whoCanBuy", "regions"],  rangeKeys: ["buyNowPrice"] },
  { id: 6, title: "Review",           subtitle: "Confirm and save",              keys: [], rangeKeys: [] },
];

const REVIEW_GROUPS: Array<{ label: string; editStep: Step; lists: RecipeListKey[]; ranges: RecipeRangeKey[] }> = [
  { label: "Vehicle & Type",  editStep: 1, lists: ["vehicleTypes","vehicleSubTypes"] as RecipeListKey[], ranges: ["year","odometer"] as RecipeRangeKey[] },
  { label: "Condition",       editStep: 2, lists: ["startCodes","airbags","primaryDamages","lossTypes","titleSaleDocs"] as RecipeListKey[], ranges: ["vehicleScore"] as RecipeRangeKey[] },
  { label: "Mechanics",       editStep: 3, lists: ["fuelTypes","cylinders","transmissions","drivelineTypes"] as RecipeListKey[], ranges: [] as RecipeRangeKey[] },
  { label: "Style & Origin",  editStep: 4, lists: ["bodyStyles","exteriorColors","interiorColors","countryOfOrigin"] as RecipeListKey[], ranges: [] as RecipeRangeKey[] },
  { label: "Sale & Audience", editStep: 5, lists: ["featuredAuctions","whoCanBuy","regions"] as RecipeListKey[], ranges: ["buyNowPrice"] as RecipeRangeKey[] },
];

function stepSelectionCount(s: typeof STEPS[number], state: RecipeFormState): number {
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
const pillIdle = `${pillBase} border-hairline/60 bg-surface-muted/40 text-muted hover:text-ink hover:border-hairline hover:bg-surface-muted/70 backdrop-blur-sm`;
const pillActive = `${pillBase} border-accent/70 bg-accent/10 text-accent shadow-[0_0_8px_0_rgba(var(--tw-shadow-color,217_119_87),.25)] backdrop-blur-sm`;

function PillGroup({ optionKey, state, patch }: {
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

function RangeGroup({ rangeKeys, state, patch }: {
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

function ReviewPill({ text }: { text: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full border border-accent/50 bg-accent/10 px-2.5 text-[12px] font-medium text-accent backdrop-blur-sm">
      {text}
    </span>
  );
}

function ReviewGroup({ label, editStep, lists, ranges, state, onEdit, readonly }: {
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

function RecipePreview({
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

function CopartRecipeEditor({
  rules,
  onChange,
  onSave,
  saving,
}: {
  rules: CopartRecipeRules;
  onChange: (next: CopartRecipeRules) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6 rounded-[12px] border border-hairline bg-surface p-6 shadow-sm">
      <div className="border-b border-hairline pb-4">
        <h2 className="font-serif text-xl text-ink">Copart 13-Rule Pre-Filtering Criteria</h2>
        <p className="mt-1 text-xs text-muted">
          These rules execute in ECS on ~135,000 raw Copart listings in under 2 seconds, retaining clean vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Minimum Model Year</label>
          <input
            type="number"
            value={rules.yearMin}
            onChange={(e) => onChange({ ...rules, yearMin: Number(e.target.value) })}
            className="h-9 w-full rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Maximum Odometer (Miles)</label>
          <input
            type="number"
            value={rules.maxOdometer}
            onChange={(e) => onChange({ ...rules, maxOdometer: Number(e.target.value) })}
            className="h-9 w-full rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rules.cleanTitleOnly}
            onChange={(e) => onChange({ ...rules, cleanTitleOnly: e.target.checked })}
            className="h-4 w-4 rounded border-hairline text-accent"
          />
          <span className="text-sm text-ink font-medium">Clean Title Only (Doc Type: CT / CLEAR)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rules.requiresRunsDrives}
            onChange={(e) => onChange({ ...rules, requiresRunsDrives: e.target.checked })}
            className="h-4 w-4 rounded border-hairline text-accent"
          />
          <span className="text-sm text-ink font-medium">Require Runs & Drives (Start Code: RUNS)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rules.requiresKeys}
            onChange={(e) => onChange({ ...rules, requiresKeys: e.target.checked })}
            className="h-4 w-4 rounded border-hairline text-accent"
          />
          <span className="text-sm text-ink font-medium">Require Keys Present (hasKeyFlag: YES)</span>
        </label>
      </div>

      <div className="pt-4 border-t border-hairline flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Spinner /> : "Save Copart Recipe"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main RecipePage ──────────────────────────────────────────────────────────

const RECIPE_SESSION_KEY = "fps_unlocked_recipe";

function getStoredRecipe(): PublicRecipe | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RECIPE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as PublicRecipe) : null;
  } catch {
    return null;
  }
}

export function RecipePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const locState = (location.state as { recipe?: PublicRecipe; mode?: string } | null) ?? null;
  const passedRecipe = locState?.recipe ?? null;
  const initialMode = locState?.mode === "preview" ? "preview" : "edit";

  const [recipe, setRecipe] = useState<PublicRecipe | null>(() => passedRecipe ?? getStoredRecipe());
  const [state, setState] = useState<RecipeFormState | null>(() => {
    const rec = passedRecipe ?? getStoredRecipe();
    return rec ? hydrateFormState(rec.filters) : null;
  });
  const [mode, setMode] = useState<"preview" | "edit">(() => (passedRecipe || getStoredRecipe() ? initialMode : "edit"));
  const [step, setStep] = useState<Step>(1);
  const [saveOpen, setSaveOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [backOpen, setBackOpen] = useState(false);
  const [recipeVersion, setRecipeVersion] = useState(() => (passedRecipe ?? getStoredRecipe())?.recipeVersion ?? "");
  const [dirty, setDirty] = useState(false);
  const [providerTab, setProviderTab] = useState<"IAAI" | "COPART">("IAAI");
  const [copartRules, setCopartRules] = useState<CopartRecipeRules>(DEFAULT_COPART_RULES);
  const [savingCopart, setSavingCopart] = useState(false);

  // In-page unlock state when locked
  const [unlockPin, setUnlockPin] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (passedRecipe) {
      setRecipe(passedRecipe);
      setState(hydrateFormState(passedRecipe.filters));
      setRecipeVersion(passedRecipe.recipeVersion ?? "");
      if (locState?.mode === "preview" || locState?.mode === "edit") {
        setMode(locState.mode);
      }
      try {
        sessionStorage.setItem(RECIPE_SESSION_KEY, JSON.stringify(passedRecipe));
      } catch {}
    }
  }, [passedRecipe, locState?.mode]);

  async function handleUnlock(pinVal?: string) {
    const p = pinVal ?? unlockPin;
    if (p.length < 6) {
      setUnlockError("Enter all 6 digits.");
      return;
    }
    setUnlockError("");
    setUnlocking(true);
    try {
      const unl = await unlockAdminRecipe(p);
      setRecipe(unl);
      setState(hydrateFormState(unl.filters));
      setRecipeVersion(unl.recipeVersion ?? "");
      setMode("preview");
      try {
        sessionStorage.setItem(RECIPE_SESSION_KEY, JSON.stringify(unl));
      } catch {}
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : "Invalid PIN.");
      setUnlockPin("");
    } finally {
      setUnlocking(false);
    }
  }

  function handleLock() {
    try {
      sessionStorage.removeItem(RECIPE_SESSION_KEY);
    } catch {}
    setRecipe(null);
    setState(null);
    setUnlockPin("");
    setUnlockError("");
  }

  if (!recipe || !state) {
    return (
      <div className="space-y-6">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">Settings</h1>
            <p className="mt-0.5 text-sm text-muted">Scrape recipe configuration &amp; filters.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(paths.adminCrawler)}
            className="text-xs text-muted hover:text-ink flex items-center gap-1.5"
          >
            ← Back to Schedules
          </button>
        </div>

        <div className="mx-auto mt-6 max-w-sm rounded-[12px] border border-hairline bg-surface p-7 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="5" y="3.5" width="14" height="17" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-xl text-ink">Unlock recipe</h2>
              <p className="text-xs text-muted">Enter your 6-digit PIN to view and edit.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <PinBoxInput
              value={unlockPin}
              onChange={setUnlockPin}
              onComplete={(p) => void handleUnlock(p)}
              autoFocus
              label="Recipe PIN"
            />
            {unlockError ? (
              <p className="rounded-[8px] border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {unlockError}
              </p>
            ) : null}
            <Button
              className="w-full"
              disabled={unlocking || unlockPin.length < 6}
              onClick={() => void handleUnlock()}
            >
              {unlocking ? <Spinner /> : "Unlock recipe"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function patch(next: Partial<RecipeFormState>) {
    setDirty(true);
    setState((c) => (c ? { ...c, ...next } : c));
  }

  function handleBack() {
    if (dirty) setBackOpen(true); else setMode("preview");
  }

  // ── Preview mode ──────────────────────────────────────────────────────────
  if (mode === "preview") {
    return (
      <div className="space-y-4">
        {/* Top Provider Tab Switcher */}
        <div className="inline-flex p-0.5 rounded-[8px] border border-hairline bg-surface">
          <button
            type="button"
            onClick={() => setProviderTab("IAAI")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              providerTab === "IAAI"
                ? "border border-accent/70 bg-accent/10 text-accent shadow-[0_0_8px_0_rgba(217,119,87,.25)]"
                : "text-muted hover:text-ink hover:bg-surface-muted"
            }`}
          >
            IAAI Recipe (Search Facets)
          </button>
          <button
            type="button"
            onClick={() => setProviderTab("COPART")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              providerTab === "COPART"
                ? "border border-accent/70 bg-accent/10 text-accent shadow-[0_0_8px_0_rgba(217,119,87,.25)]"
                : "text-muted hover:text-ink hover:bg-surface-muted"
            }`}
          >
            Copart Recipe (13 Vectorized Rules)
          </button>
        </div>

        {providerTab === "COPART" ? (
          <CopartRecipeEditor
            rules={copartRules}
            onChange={setCopartRules}
            onSave={async () => {
              setSavingCopart(true);
              try {
                const res = await fetch("/api/admin/recipes?source=copart", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ rules: copartRules }),
                });
                if (res.ok) alert("Copart 13-Rule Pre-filter recipe saved successfully!");
                else alert("Failed to save Copart recipe.");
              } catch (e: any) {
                alert("Error saving Copart recipe: " + e.message);
              } finally {
                setSavingCopart(false);
              }
            }}
            saving={savingCopart}
          />
        ) : (
          <>
            <RecipePreview
              recipe={recipe}
              state={state}
              onEdit={() => { setStep(1); setMode("edit"); }}
              onChangePinOpen={() => setPinOpen(true)}
              onLock={handleLock}
            />
            <RecipePinChangeModal open={pinOpen} onClose={() => setPinOpen(false)} onChanged={() => setPinOpen(false)} />
          </>
        )}
      </div>
    );
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  const currentStepDef = STEPS.find((s) => s.id === step)!;
  const boolActive = RECIPE_BOOL_KEYS.filter((k) => state[k] as boolean);

  return (
    <div className="space-y-6">
      {/* Header — no save/PIN icons, only back + title */}
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" aria-label="Back" onClick={handleBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">Edit recipe</h1>
          <p className="mt-0.5 text-sm text-muted">{recipeVersion || recipe.recipeVersion || "—"} · updated {formatWhen(recipe.updatedAt)}</p>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex-1 h-1 rounded-full bg-hairline overflow-hidden">
          <div className="h-full rounded-full bg-accent transition-all duration-[300ms]" style={{ width: `${((step - 1) / (TOTAL - 1)) * 100}%` }} />
        </div>
        <span className="shrink-0 text-sm text-muted">Step {step} of {TOTAL} — <span className="text-ink">{currentStepDef.title}</span></span>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left sidebar (desktop only) */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="rounded-[8px] border border-hairline bg-surface p-4">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Recipe journey</p>
            <ol className="space-y-0">
              {STEPS.map((s, idx) => {
                const totalCount = s.id < 6 ? stepSelectionCount(s, state) : 0;
                const isActive = step === s.id;
                const isPast = s.id < step;
                const hasSelections = totalCount > 0;
                const isCompleted = isPast || (hasSelections && !isActive);
                return (
                  <li key={s.id}>
                    <button type="button" onClick={() => setStep(s.id)}
                      className="flex w-full items-start gap-3 py-1.5 text-left hover:opacity-80">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold transition-all duration-[150ms] ${
                          isActive ? "bg-accent text-canvas shadow-[0_0_10px_2px_rgba(217,119,87,.35)]"
                            : isCompleted ? "border border-accent bg-accent/15 text-accent"
                            : "bg-surface-muted text-muted"
                        }`}>
                          {isCompleted && !isActive ? (
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : s.id}
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`mt-0.5 w-0.5 h-8 rounded-full transition-colors duration-[150ms] ${isCompleted ? "bg-accent/40" : "bg-hairline"}`} />
                        )}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className={`text-[13px] font-medium leading-5 transition-colors duration-[120ms] ${isActive ? "text-ink" : "text-muted"}`}>{s.title}</p>
                        <p className="text-[11px] text-muted mt-0.5">
                          {s.id === 6 ? "Confirm & save" : totalCount > 0 ? `${totalCount} selected` : s.subtitle}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="rounded-[8px] border border-hairline bg-surface p-5 lg:p-6">
            <div className="mb-6">
              <h2 className="font-serif text-xl text-ink">{currentStepDef.title}</h2>
              <p className="mt-0.5 text-sm text-muted">{currentStepDef.subtitle}</p>
            </div>

            {step < 6 && (
              <div className="space-y-8">
                {(currentStepDef.rangeKeys?.length ?? 0) > 0 && (
                  <RangeGroup rangeKeys={currentStepDef.rangeKeys!} state={state} patch={patch} />
                )}
                {step === 5 && (
                  <section className="space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium text-ink">Quick conditions</h3>
                      <span className="shrink-0 text-[11px] text-muted">{boolActive.length > 0 ? `${boolActive.length} active` : "Any"}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {RECIPE_BOOL_KEYS.map((key) => {
                        const active = state[key] as boolean;
                        return (
                          <button key={key} type="button" aria-pressed={active}
                            onClick={() => patch({ [key]: !active })}
                            className={active ? `${pillActive} h-9 px-4` : `${pillIdle} h-9 px-4`}>
                            {active && <svg viewBox="0 0 24 24" className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            {RECIPE_LABELS[key]}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
                {currentStepDef.keys.map((key) => (
                  <PillGroup key={key} optionKey={key} state={state} patch={patch} />
                ))}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                {boolActive.length > 0 && (
                  <div className="overflow-hidden rounded-[8px] border border-hairline bg-surface">
                    <div className="flex items-center justify-between border-b border-hairline bg-surface-muted px-4 py-2">
                      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Quick conditions</span>
                      <button type="button" onClick={() => setStep(5)} className="text-[11px] text-accent hover:underline">Edit →</button>
                    </div>
                    <div className="flex flex-wrap gap-2 px-4 py-3">
                      {boolActive.map((k) => <ReviewPill key={k} text={RECIPE_LABELS[k]} />)}
                    </div>
                  </div>
                )}
                {REVIEW_GROUPS.map((g) => (
                  <ReviewGroup key={g.label} label={g.label} editStep={g.editStep} lists={g.lists} ranges={g.ranges} state={state} onEdit={setStep} />
                ))}
                {boolActive.length === 0 && REVIEW_GROUPS.every((g) => {
                  const hasLists = g.lists.some((k) => ((state[k] as string[]) || []).length > 0);
                  const hasRanges = g.ranges.some((k) => { const d = state[k] as { min: string; max: string }; return d.min || d.max; });
                  return !hasLists && !hasRanges;
                }) && (
                  <p className="text-sm text-muted">No filters selected — all lots will be scraped.</p>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <Button variant="secondary" disabled={step === 1} onClick={() => setStep((s) => (s - 1) as Step)}>← Previous</Button>
              <div className="flex items-center gap-2">
                {step < TOTAL && (
                  <Button variant="ghost" onClick={() => setStep(TOTAL as Step)}>Skip to Review</Button>
                )}
                {step < TOTAL ? (
                  <Button onClick={() => setStep((s) => (s + 1) as Step)}>Next →</Button>
                ) : (
                  <Button onClick={() => setSaveOpen(true)}>Save recipe</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecipeSaveModal
        open={saveOpen}
        state={state}
        onClose={() => setSaveOpen(false)}
        onSaved={(version) => {
          setRecipeVersion(version);
          setDirty(false);
          setMode("preview");
          if (recipe) {
            const updatedRecipe: PublicRecipe = {
              ...recipe,
              recipeVersion: version,
              filters: serializeCatalog(state),
              updatedAt: new Date().toISOString(),
            };
            setRecipe(updatedRecipe);
            try {
              sessionStorage.setItem(RECIPE_SESSION_KEY, JSON.stringify(updatedRecipe));
            } catch {}
          }
        }}
      />
      <RecipePinChangeModal open={pinOpen} onClose={() => setPinOpen(false)} onChanged={() => setPinOpen(false)} />
      <Dialog open={backOpen} title="Leave without saving?" confirmLabel="Discard" cancelLabel="Stay" danger
        onClose={() => setBackOpen(false)} onConfirm={() => { setDirty(false); setMode("preview"); }}>
        Your unsaved recipe changes will be lost.
      </Dialog>
    </div>
  );
}
