"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "@/compat/router";
import { listInventory } from "../../api/inventory";
import { getRecipe } from "../../api/recipe";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { PageStepper } from "../../components/PageStepper";
import { SelectMenu } from "../../components/SelectMenu";
import { FairOrb } from "../../components/orb/FairOrb";
import { CustomizeListModal } from "../../features/inventory/CustomizeListModal";
import { FilterLoadModal } from "../../features/inventory/FilterLoadModal";
import { FilterSaveModal } from "../../features/inventory/FilterSaveModal";
import { InventoryLotList } from "../../features/inventory/InventoryLotRow";
import { InventoryToolbar } from "../../features/inventory/InventoryToolbar";
import { PhonePromptModal } from "../../features/inventory/PhonePromptModal";
import { favoriteKey, useFavorites } from "../../features/inventory/useFavorites";
import {
  DEFAULT_CARD_FIELDS,
  loadCardFields,
  saveCardFields,
  type CardFieldId,
} from "../../features/inventory/cardFields";
import {
  inventoryHasFilters,
  PAGE_SIZES,
  parseInventorySearch,
  toInventorySearch,
  type InventoryQuery,
  type PageSize,
} from "../../features/inventory/query";
import type { FavoriteItem, InventoryItem } from "../../types/api";

export function InventoryListPage() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parseInventorySearch(params.toString()), [params]);
  const recipe = useQuery({ queryKey: ["recipe"], queryFn: getRecipe });
  const [draft, setDraft] = useState(query.modelContains || "");
  const [cursors, setCursors] = useState<string[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [phonePromptOpen, setPhonePromptOpen] = useState(false);
  const [pendingLot, setPendingLot] = useState<{
    stockNumber: string;
    lotData?: Partial<FavoriteItem>;
  } | null>(null);
  const [onlyInterested, setOnlyInterested] = useState(false);
  const [fields, setFields] = useState<CardFieldId[]>([...DEFAULT_CARD_FIELDS]);

  const favorites = useFavorites({
    onPhoneRequired: () => setPhonePromptOpen(true),
  });

  const cursor = cursors[cursors.length - 1];
  const pageIndex = cursors.length + 1;
  const listQuery = { ...query, cursor };
  const page = useQuery({
    queryKey: ["inventory", listQuery],
    queryFn: () => listInventory(listQuery),
  });

  const replaceQuery = useCallback(
    (next: InventoryQuery) => {
      setParams(toInventorySearch({ ...next, cursor: undefined }, false), { replace: true });
    },
    [setParams]
  );

  useEffect(() => { setFields(loadCardFields()); }, []);

  useEffect(() => {
    setDraft(query.modelContains || "");
    setCursors([]);
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

  const handleToggleFavorite = useCallback(
    (item: InventoryItem) => {
      const lotData: Partial<FavoriteItem> = {
        stockNumber: item.stockNumber,
        source: item.source,
        title: item.title,
        imageUrl: item.imageUrl,
        vin: item.vin,
        branch: item.branch,
        auctionDate: item.auctionDate,
        auctionAt: item.auctionAt,
        currentBid: item.currentBid,
        acv: item.acv,
        primaryDamage: item.primaryDamage,
      };
      setPendingLot({ stockNumber: item.stockNumber, lotData });
      void favorites.toggle(item.stockNumber, lotData);
    },
    [favorites]
  );

  const rawItems: InventoryItem[] = page.data?.items ?? [];
  const total = page.data?.total;
  const filtered = inventoryHasFilters(query);

  const items = useMemo(() => {
    if (!onlyInterested) return rawItems;
    const favMap = new Map(favorites.favorites.map((f) => [favoriteKey(f.stockNumber, f.source), f]));
    const currentFavs = rawItems.filter((it) => favMap.has(favoriteKey(it.stockNumber, it.source)));
    const currentStockSet = new Set(currentFavs.map((it) => favoriteKey(it.stockNumber, it.source)));
    const extraFavs: InventoryItem[] = favorites.favorites
      .filter((f) => !currentStockSet.has(favoriteKey(f.stockNumber, f.source)))
      .map((f) => ({
        stockNumber: f.stockNumber,
        source: (f.source === "COPART" ? "COPART" : "IAAI"),
        title: f.title,
        imageUrl: f.imageUrl,
        vin: f.vin,
        branch: f.branch,
        auctionDate: f.auctionDate,
        auctionAt: f.auctionAt,
        currentBid: f.currentBid,
        acv: f.acv,
        primaryDamage: f.primaryDamage,
      }));
    return [...currentFavs, ...extraFavs];
  }, [onlyInterested, rawItems, favorites.favorites]);

  return (
    <div className="space-y-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">
            Inventory
            {total != null ? (
              <span className="ml-2 text-muted">({total})</span>
            ) : items.length > 0 ? (
              <span className="ml-2 text-muted">({items.length})</span>
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
      <InventoryToolbar
        search={draft}
        onSearch={setDraft}
        recipe={recipe.data?.filters}
        query={query}
        onChange={replaceQuery}
        onCustomize={() => setCustomOpen(true)}
        onSave={() => setSaveOpen(true)}
        onLoad={() => setLoadOpen(true)}
        onlyInterested={onlyInterested}
        onToggleInterested={() => setOnlyInterested((prev) => !prev)}
        interestedCount={favorites.favorites.length}
      />
      {page.isLoading && !onlyInterested ? <FairOrb state="working" /> : null}
      {page.error && !onlyInterested ? (
        <Card>
          <p className="text-sm text-danger">{page.error.message}</p>
          <Button className="mt-3" variant="secondary" onClick={() => void page.refetch()}>
            Retry
          </Button>
        </Card>
      ) : null}
      {!page.isLoading && !page.error && items.length === 0 ? (
        <EmptyState>
          {onlyInterested
            ? "No interested vehicles yet. Click the heart icon on any vehicle to add it here and notify our team."
            : filtered
            ? "No lots match."
            : "No live lots yet."}
        </EmptyState>
      ) : null}
      {items.length > 0 ? (
        <InventoryLotList
          items={items}
          query={query}
          fields={fields}
          isFavorite={favorites.isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : null}
      <CustomizeListModal
        open={customOpen}
        selected={fields}
        onClose={() => setCustomOpen(false)}
        onChange={setCardFields}
      />
      <FilterSaveModal
        open={saveOpen}
        query={query}
        recipe={recipe.data?.filters ?? {}}
        onClose={() => setSaveOpen(false)}
      />
      <FilterLoadModal
        open={loadOpen}
        query={query}
        onLoad={(next) => { replaceQuery(next); setLoadOpen(false); }}
        onClose={() => setLoadOpen(false)}
      />
      <PhonePromptModal
        open={phonePromptOpen}
        onClose={() => setPhonePromptOpen(false)}
        onSuccess={() => {
          if (pendingLot) {
            void favorites.toggle(pendingLot.stockNumber, pendingLot.lotData);
          }
        }}
      />
    </div>
  );
}
