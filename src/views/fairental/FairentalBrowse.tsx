"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/Button";
import { ApiError } from "@/api/errors";
import { fairentalFacets, listFairental, type FairentalCard, type FairentalFacets } from "./fairentalApi";
import { FairentalToolbar } from "./FairentalToolbar";
import { readFilters, toSearchParams, type FairentalFilters } from "./filters";
import { VehicleGrid } from "./VehicleGrid";
import { FairOrb } from "@/components/orb/FairOrb";

export function FairentalBrowse({
  admin,
  onEdit,
  onCreate,
}: {
  admin?: boolean;
  onEdit?: (car: FairentalCard) => void;
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

  const count = facets?.total;
  const heading = (
    <div className="min-w-0">
      <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] text-ink lg:text-[34px] lg:leading-10">
        Fairental
        {typeof count === "number" ? (
          <span className="ml-2 text-muted tabular">({count.toLocaleString("en-US")})</span>
        ) : null}
      </h1>
      <p className="mt-1 text-sm text-muted">Cars listed by FairPy.</p>
    </div>
  );

  const body = (
    <div className="space-y-4">
      {heading}
      <FairentalToolbar
        filters={filters}
        facets={facets}
        search={query}
        onSearch={setQuery}
        onChange={replace}
        admin={admin}
        onCreate={onCreate}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {loading && cars.length === 0 ? (
        <FairOrb state="working" />
      ) : (
        <VehicleGrid cars={cars} admin={admin} onEdit={onEdit} loading={loading} />
      )}
      {cursor ? (
        <Button variant="secondary" onClick={() => void loadMore()}>Load more</Button>
      ) : null}
    </div>
  );

  if (admin) return body;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <PublicHeader mode="inventory" />
      <main className="public-page-frame min-w-0 flex-1">{body}</main>
    </div>
  );
}
