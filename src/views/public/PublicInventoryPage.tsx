"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "@/compat/router";
import { useQuery } from "@tanstack/react-query";
import { listPublicInventory } from "../../api/publicInventory";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { PageStepper } from "../../components/PageStepper";
import { SelectMenu } from "../../components/SelectMenu";
import { FairOrb } from "../../components/orb/FairOrb";
import { CopilotDrawer } from "../../components/copilot/CopilotDrawer";
import { CustomizeListModal } from "../../features/inventory/CustomizeListModal";
import { InventoryLotList } from "../../features/inventory/InventoryLotRow";
import { loadLotShots } from "../../features/inventory/loadLotShots";
import { InventoryToolbar } from "../../features/inventory/InventoryToolbar";
import { SHOWCASE_INVENTORY } from "../../features/inventory/showcaseData";
import {
  DEFAULT_CARD_FIELDS,
  loadCardFields,
  saveCardFields,
  type CardFieldId,
} from "../../features/inventory/cardFields";
import {
  inventoryHasFilters,
  inventoryLoadedCount,
  PAGE_SIZES,
  parseInventorySearch,
  toInventorySearch,
  type InventoryQuery,
  type PageSize,
} from "../../features/inventory/query";
import type { InventoryItem } from "../../types/api";
import type { RecipeFilters } from "../../types/filters";
import { paths } from "../../routes/paths";
import { PublicHeader } from "@/components/layout/PublicHeader";

const DEFAULT_PUBLIC_RECIPE: RecipeFilters = {
  vehicleTypes: ["Automobile", "SUV", "Truck", "Electric", "Luxury"],
  fuelTypes: ["Gasoline", "Electric", "Hybrid", "Diesel"],
  primaryDamages: ["Normal Wear", "Minor Dent/Scratches", "Rear End", "Front End", "Hail"],
  bodyStyles: ["Sedan", "SUV", "Truck", "Coupe", "Hatchback"],
  startCodes: ["Run & Drive", "Engine Start Only", "Stationary"],
  year: { min: 2015, max: 2026 },
};

export function PublicInventoryPage() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseInventorySearch(params.toString()), [params]);
  const [draft, setDraft] = useState(query.modelContains || "");
  const [cursors, setCursors] = useState<string[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<"favorite" | "save" | "bid">("favorite");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [onlyInterested, setOnlyInterested] = useState(false);
  const [guestFavorites, setGuestFavorites] = useState<string[]>([]);
  const [fields, setFields] = useState<CardFieldId[]>([...DEFAULT_CARD_FIELDS]);
  const [loaded, setLoaded] = useState(0);

  const cursor = cursors[cursors.length - 1];
  const pageIndex = cursors.length + 1;

  // Query live API (with automatic fallback to SHOWCASE_INVENTORY for preview/testing)
  const listQuery = { ...query, cursor };
  const page = useQuery({
    queryKey: ["public-inventory", listQuery],
    queryFn: async () => {
      try {
        const res = await listPublicInventory({
          types: query.vehicleTypes,
          damage: query.primaryDamages,
          search: query.modelContains,
          limit: query.limit || 25,
          cursor: listQuery.cursor,
        });
        if (res && res.items && res.items.length > 0) {
          return res;
        }
      } catch {
        // Fallback for local preview if backend is not deployed to AWS yet
      }

      // Filter showcase inventory locally based on user filters
      let filtered = [...SHOWCASE_INVENTORY];
      if (query.modelContains) {
        const mc = query.modelContains.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.title?.toLowerCase().includes(mc) ||
            i.make?.toLowerCase().includes(mc) ||
            i.model?.toLowerCase().includes(mc) ||
            i.vin?.toLowerCase().includes(mc) ||
            i.stockNumber.includes(mc)
        );
      }
      if (query.vehicleTypes && query.vehicleTypes.length > 0) {
        filtered = filtered.filter((i) =>
          query.vehicleTypes!.some((vt) => i.vehicleType?.toLowerCase() === vt.toLowerCase() || i.bodyStyle?.toLowerCase() === vt.toLowerCase())
        );
      }
      if (query.primaryDamages && query.primaryDamages.length > 0) {
        filtered = filtered.filter((i) =>
          query.primaryDamages!.some((pd) => i.primaryDamage?.toLowerCase() === pd.toLowerCase())
        );
      }

      return {
        items: filtered,
        nextCursor: null,
        limit: query.limit || 25,
        total: filtered.length,
      };
    },
  });

  const replaceQuery = useCallback(
    (next: InventoryQuery) => {
      setParams(toInventorySearch({ ...next, cursor: undefined }, false), { replace: true });
    },
    [setParams]
  );

  useEffect(() => {
    setFields(loadCardFields());
    try {
      const saved = localStorage.getItem("fairpy_guest_favorites");
      if (saved) setGuestFavorites(JSON.parse(saved));
    } catch { }
  }, []);

  useEffect(() => {
    setDraft(query.modelContains || "");
    setCursors([]);
    setLoaded(0);
  }, [params, query.modelContains]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft === (query.modelContains || "")) return;
      replaceQuery({ ...query, modelContains: draft || undefined });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draft, query, replaceQuery]);

  function setCardFields(next: CardFieldId[]) {
    setFields(next);
    saveCardFields(next);
  }

  const handleToggleFavorite = useCallback((item: InventoryItem) => {
    setSelectedStock(item.stockNumber);
    setAuthModalReason("favorite");
    setAuthModalOpen(true);
  }, []);

  const rawItems: InventoryItem[] = page.data?.items ?? [];
  const pageLength = rawItems.length;

  useEffect(() => {
    if (pageLength === 0) return;
    setLoaded((current) => inventoryLoadedCount(current, pageIndex, query.limit, pageLength));
  }, [pageIndex, pageLength, query.limit]);

  const filtered = inventoryHasFilters(query);

  const items = useMemo(() => {
    if (!onlyInterested) return rawItems;
    const favSet = new Set(guestFavorites);
    return rawItems.filter((it) => favSet.has(it.stockNumber));
  }, [onlyInterested, rawItems, guestFavorites]);

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-ink">
      {/* 1. UNIFIED GLASS PUBLIC HEADER: Home nav link, theme toggle, and Sign In */}
      <PublicHeader mode="inventory" />

      {/* 2. FULL-PAGE INVENTORY WORKSPACE */}
      <main className="public-page-frame min-w-0 flex-1 space-y-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10 text-ink">
              Inventory
              {loaded > 0 ? (
                <span className="ml-2 text-muted tabular">({loaded})</span>
              ) : null}
            </h1>
            <p className="mt-1 text-sm text-muted">Live auction lots.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SelectMenu
              label="Page size"
              value={query.limit}
              options={[...PAGE_SIZES]}
              onChange={(limit: PageSize) => replaceQuery({ ...query, limit })}
            />
            <PageStepper
              page={pageIndex}
              hasPrev={cursors.length > 0}
              hasNext={Boolean(page.data?.nextCursor)}
              pending={page.isFetching}
              onPrev={() => setCursors((s) => s.slice(0, -1))}
              onNext={() => {
                const next = page.data?.nextCursor;
                if (next) setCursors((s) => [...s, next]);
              }}
            />
          </div>
        </div>

        {/* EXACT INTERNAL INVENTORY TOOLBAR */}
        <InventoryToolbar
          search={draft}
          onSearch={setDraft}
          recipe={DEFAULT_PUBLIC_RECIPE}
          query={query}
          onChange={replaceQuery}
          onCustomize={() => setCustomOpen(true)}
          onSave={() => {
            setAuthModalReason("save");
            setAuthModalOpen(true);
          }}
          onLoad={() => {
            setAuthModalReason("save");
            setAuthModalOpen(true);
          }}
          onlyInterested={onlyInterested}
          onToggleInterested={() => setOnlyInterested((prev) => !prev)}
          interestedCount={guestFavorites.length}
        />

        {page.isLoading && !onlyInterested ? <FairOrb state="working" /> : null}

        {page.error && !onlyInterested && items.length === 0 ? (
          <Card>
            <p className="text-sm text-danger">{page.error.message}</p>
            <Button className="mt-3" variant="secondary" onClick={() => void page.refetch()}>
              Retry
            </Button>
          </Card>
        ) : null}

        {!page.isLoading && items.length === 0 ? (
          <EmptyState>
            {onlyInterested
              ? "No interested vehicles yet. Click the heart icon on any vehicle to add it here."
              : filtered
                ? "No lots match your current filters."
                : "No live lots yet."}
          </EmptyState>
        ) : null}

        {/* EXACT INTERNAL INVENTORY LOT LIST TABLE */}
        {items.length > 0 ? (
          <InventoryLotList
            items={items}
            query={query}
            fields={fields}
            isFavorite={(stockNumber) => guestFavorites.includes(stockNumber)}
            onToggleFavorite={handleToggleFavorite}
            hrefFor={paths.publicInventoryItem}
            loadGallery={(stockNumber) => loadLotShots(stockNumber, "public")}
          />
        ) : null}

        {loaded > 0 ? (
          <div className="flex items-center justify-end gap-3">
            <span className="text-sm text-muted tabular">{loaded}</span>
            <PageStepper
              page={pageIndex}
              hasPrev={cursors.length > 0}
              hasNext={Boolean(page.data?.nextCursor)}
              pending={page.isFetching}
              onPrev={() => setCursors((s) => s.slice(0, -1))}
              onNext={() => {
                const next = page.data?.nextCursor;
                if (next) setCursors((s) => [...s, next]);
              }}
            />
          </div>
        ) : null}

        <CustomizeListModal
          open={customOpen}
          selected={fields}
          onClose={() => setCustomOpen(false)}
          onChange={setCardFields}
        />
      </main>

      <CopilotDrawer publicDock />

      {/* 4. GUEST AUTH CONVERSION MODAL */}
      {authModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] rounded-[16px] border border-hairline bg-surface p-6 shadow-2xl space-y-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-accent/15 text-accent">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-[20px] leading-6 tracking-[-0.02em] text-ink">
                {authModalReason === "save"
                  ? "Save Preset Filters"
                  : selectedStock
                    ? `Save Lot #${selectedStock}`
                    : "Save to Watchlist"}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Sign in to your FairPy account to track live bids, set damage alerts, and receive instant SMS notifications when lots run on the block.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`${paths.signIn}?next=${encodeURIComponent(paths.publicInventory)}`}
                className="flex h-10 w-full items-center justify-center rounded-[10px] bg-accent text-[13px] font-medium text-white shadow-sm hover:opacity-95 transition"
              >
                Sign In / Register
              </Link>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="flex h-10 w-full items-center justify-center rounded-[10px] border border-hairline bg-surface text-[13px] font-medium text-muted hover:bg-surface-muted hover:text-ink transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
