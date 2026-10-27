import {
  RECIPE_LIST_KEYS,
  type RecipeFilters,
  type RecipeListKey,
} from "../../types/filters";
import type { AuctionSource } from "../../types/api";

export const PAGE_SIZES = [10, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export type InventoryQuery = {
  limit: PageSize;
  cursor?: string;
  modelContains?: string;
  vehicleTypes?: string[];
  fuelTypes?: string[];
  transmissions?: string[];
  airbags?: string[];
  primaryDamages?: string[];
  startCodes?: string[];
  vehicleSubTypes?: string[];
  cylinders?: string[];
  drivelineTypes?: string[];
  bodyStyles?: string[];
  exteriorColors?: string[];
  interiorColors?: string[];
  countryOfOrigin?: string[];
  lossTypes?: string[];
  titleSaleDocs?: string[];
  featuredAuctions?: string[];
  whoCanBuy?: string[];
  regions?: string[];
  yearMin?: string;
  yearMax?: string;
  odoMin?: string;
  odoMax?: string;
  scoreMin?: string;
  scoreMax?: string;
  buyNowMin?: string;
  buyNowMax?: string;
  source?: AuctionSource | "ALL";
};

type RangeQueryKey = "yearMin" | "yearMax" | "odoMin" | "odoMax" | "scoreMin" | "scoreMax";

const RANGE_QUERY: Array<{ min: RangeQueryKey; max: RangeQueryKey }> = [
  { min: "yearMin", max: "yearMax" },
  { min: "odoMin", max: "odoMax" },
  { min: "scoreMin", max: "scoreMax" },
];

export function defaultInventoryQuery(): InventoryQuery {
  return { limit: 25 };
}

export function parseInventorySearch(search: string): InventoryQuery {
  const params = new URLSearchParams(search);
  const limitRaw = Number(params.get("limit") || 25);
  const limit: PageSize = PAGE_SIZES.includes(limitRaw as PageSize) ? (limitRaw as PageSize) : 25;
  const query: InventoryQuery = { limit };
  const model = params.get("q")?.trim();
  if (model) {
    query.modelContains = model;
  }
  const cursor = params.get("cursor")?.trim();
  if (cursor) {
    query.cursor = cursor;
  }
  const src = params.get("source")?.trim().toUpperCase();
  if (src === "IAAI" || src === "COPART" || src === "ALL") {
    query.source = src as AuctionSource | "ALL";
  }
  for (const key of RECIPE_LIST_KEYS) {
    const raw = params.get(key);
    if (raw) {
      query[key] = raw.split(",").map((part) => part.trim()).filter(Boolean);
    }
  }
  for (const range of RANGE_QUERY) {
    const lo = params.get(range.min)?.trim();
    const hi = params.get(range.max)?.trim();
    if (lo) {
      query[range.min] = lo;
    }
    if (hi) {
      query[range.max] = hi;
    }
  }
  return query;
}

export function toInventorySearch(query: InventoryQuery, includeCursor = true): URLSearchParams {
  const params = new URLSearchParams();
  params.set("limit", String(query.limit));
  if (query.modelContains) {
    params.set("q", query.modelContains);
  }
  if (includeCursor && query.cursor) {
    params.set("cursor", query.cursor);
  }
  if (query.source && query.source !== "ALL") {
    params.set("source", query.source);
  }
  for (const key of RECIPE_LIST_KEYS) {
    const values = query[key];
    if (values && values.length > 0) {
      params.set(key, values.join(","));
    }
  }
  for (const range of RANGE_QUERY) {
    const lo = query[range.min];
    const hi = query[range.max];
    if (lo) {
      params.set(range.min, String(lo));
    }
    if (hi) {
      params.set(range.max, String(hi));
    }
  }
  return params;
}

export function toInventoryApiSearch(query: InventoryQuery): URLSearchParams {
  const params = toInventorySearch(query, true);
  const model = params.get("q");
  if (model) {
    params.delete("q");
    params.set("modelContains", model);
  }
  return params;
}

export function inventoryHref(query: InventoryQuery, includeCursor = false): string {
  const suffix = toInventorySearch(query, includeCursor).toString();
  return suffix ? `/app/inventory?${suffix}` : "/app/inventory";
}

export function listFiltersFromRecipe(recipe: RecipeFilters): RecipeListKey[] {
  return RECIPE_LIST_KEYS.filter((key) => Array.isArray(recipe[key]) && (recipe[key] || []).length > 0);
}

export function inventoryReachedCount(pageIndex: number, pageSize: number, pageLength: number): number {
  if (pageLength <= 0 || pageSize <= 0) return 0;
  return Math.max(0, pageIndex - 1) * pageSize + pageLength;
}

export function inventoryLoadedCount(loaded: number, pageIndex: number, pageSize: number, pageLength: number): number {
  return Math.max(0, loaded, inventoryReachedCount(pageIndex, pageSize, pageLength));
}

export function inventoryHasFilters(query: InventoryQuery): boolean {
  return Boolean(query.modelContains) || inventoryFacetCount(query) > 0;
}

export function inventoryFacetCount(query: InventoryQuery): number {
  let count = 0;
  for (const key of RECIPE_LIST_KEYS) {
    count += (query[key] || []).length;
  }
  for (const key of ["yearMin", "yearMax", "odoMin", "odoMax", "scoreMin", "scoreMax"] as const) {
    if (query[key]) {
      count += 1;
    }
  }
  if (query.source === "IAAI" || query.source === "COPART") {
    count += 1;
  }
  return count;
}
