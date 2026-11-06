"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ApiError } from "@/api/errors";
import { AppliedChips } from "./AppliedChips";
import { fairentalFacets, listFairental, type FairentalCard, type FairentalFacets } from "./fairentalApi";
import { FilterPanel } from "./FilterPanel";
import { FilterSheet } from "./FilterSheet";
import { EMPTY_FILTERS, readFilters, toSearchParams, type FairentalFilters } from "./filters";
import { VehicleGrid } from "./VehicleGrid";

export function FairentalBrowse({
  admin,
  onEdit,
  onCreate,
}: {
  admin?: boolean;
  onEdit?: (vin: string) => void;
  onCreate?: () => void;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = readFilters(params);
  const [query, setQuery] = useState(filters.q);
  const [cars, setCars] = useState<FairentalCard[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [facets, setFacets] = useState<FairentalFacets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(false);
  const filterKey = toSearchParams(filters, !!admin).toString();

  useEffect(() => {
    setQuery(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (query.trim() === filters.q.trim()) return;
      replace({ ...filters, q: query });
    }, 400);
    return () => window.clearTimeout(handle);
    // filterKey stands in for the rest of the filter set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filterKey]);

  useEffect(() => {
    let gone = false;
    setLoading(true);
    setError("");
    Promise.all([listFairental(filters, !!admin), fairentalFacets(filters, !!admin)])
      .then(([page, nextFacets]) => {
        if (gone) return;
        setCars(page.items);
        setCursor(page.nextCursor);
        setFacets(nextFacets);
      })
      .catch((err: unknown) => {
        if (!gone) setError(err instanceof ApiError ? err.message : "The showroom could not be loaded");
      })
      .finally(() => {
        if (!gone) setLoading(false);
      });
    return () => {
      gone = true;
    };
  }, [filterKey, admin]);

  function replace(next: FairentalFilters) {
    const text = toSearchParams(next, !!admin).toString();
    router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
  }

  async function loadMore() {
    if (!cursor) return;
    const page = await listFairental(filters, !!admin, cursor);
    setCars((current) => [...current, ...page.items]);
    setCursor(page.nextCursor);
  }

  const panel = (
    <FilterPanel
      filters={filters}
      facets={facets}
      query={query}
      onQuery={setQuery}
      onChange={replace}
      onClear={() => replace(EMPTY_FILTERS)}
      admin={admin}
    />
  );

  return (
    <div className={admin ? "fairautos-landing" : "fairautos-landing min-h-screen"}>
      {admin ? null : <PublicHeader mode="inventory" />}
      <main className={admin ? "" : "mx-auto max-w-6xl px-4 pb-16 pt-28 lg:px-8"}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--fs-muted)]">Fairental Sales</p>
            <h1 className="text-[40px] leading-none text-[var(--fs-ink)]">The cars we keep</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-full border border-[var(--fs-line)] px-4 py-2 text-[13px] lg:hidden" onClick={() => setSheet(true)}>
              Filters
            </button>
            {admin ? (
              <button type="button" onClick={onCreate} className="rounded-full bg-[var(--fs-claude-orange)] px-4 py-2 text-[13px] text-white">
                Add car
              </button>
            ) : null}
          </div>
        </div>
        {error ? <p className="mb-4 text-[14px] text-[var(--fs-claude-orange)]">{error}</p> : null}
        <div className="flex items-start gap-5">
          <div className="sticky top-24 hidden lg:block">{panel}</div>
          <div className="min-w-0 flex-1 space-y-4">
            <AppliedChips filters={filters} onChange={replace} />
            <VehicleGrid cars={cars} admin={admin} onEdit={onEdit} loading={loading} />
            {cursor ? (
              <button type="button" onClick={() => void loadMore()} className="rounded-full border border-[var(--fs-line)] px-4 py-2 text-[13px]">
                Load more
              </button>
            ) : null}
          </div>
        </div>
      </main>
      <FilterSheet open={sheet} onClose={() => setSheet(false)}>{panel}</FilterSheet>
    </div>
  );
}
