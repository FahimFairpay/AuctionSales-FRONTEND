import type { InventoryItem, InventoryPage } from "../types/api";
import { publicApiGet } from "./publicClient";

export interface PublicInventoryQuery {
  makes?: string[];
  models?: string[];
  types?: string[];
  damage?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  odoMin?: number;
  odoMax?: number;
  scoreMin?: number;
  scoreMax?: number;
  fuelTypes?: string[];
  transmissions?: string[];
  airbags?: string[];
  startCodes?: string[];
  bodyStyles?: string[];
  search?: string;
  source?: "IAAI" | "COPART";
  sort?: "score" | "bid_asc" | "bid_desc" | "year_desc" | "spread_desc";
  page?: number;
  limit?: number;
  cursor?: string;
}

export function toPublicInventorySearch(query: PublicInventoryQuery): string {
  const params = new URLSearchParams();
  if (query.makes?.length) params.set("makes", query.makes.join(","));
  if (query.models?.length) params.set("models", query.models.join(","));
  if (query.types?.length) params.set("types", query.types.join(","));
  if (query.damage?.length) params.set("damage", query.damage.join(","));
  if (query.yearMin !== undefined) params.set("yearMin", String(query.yearMin));
  if (query.yearMax !== undefined) params.set("yearMax", String(query.yearMax));
  if (query.priceMin !== undefined) params.set("priceMin", String(query.priceMin));
  if (query.priceMax !== undefined) params.set("priceMax", String(query.priceMax));
  if (query.odoMin !== undefined) params.set("odoMin", String(query.odoMin));
  if (query.odoMax !== undefined) params.set("odoMax", String(query.odoMax));
  if (query.scoreMin !== undefined) params.set("scoreMin", String(query.scoreMin));
  if (query.scoreMax !== undefined) params.set("scoreMax", String(query.scoreMax));
  if (query.fuelTypes?.length) params.set("fuelTypes", query.fuelTypes.join(","));
  if (query.transmissions?.length) params.set("transmissions", query.transmissions.join(","));
  if (query.airbags?.length) params.set("airbags", query.airbags.join(","));
  if (query.startCodes?.length) params.set("startCodes", query.startCodes.join(","));
  if (query.bodyStyles?.length) params.set("bodyStyles", query.bodyStyles.join(","));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.source) params.set("source", query.source);
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.cursor) params.set("cursor", query.cursor);
  return params.toString();
}

export function listPublicInventory(query: PublicInventoryQuery = {}): Promise<InventoryPage> {
  const qs = toPublicInventorySearch(query);
  return publicApiGet<InventoryPage>(qs ? `/public/inventory?${qs}` : "/public/inventory");
}

export function getPublicInventoryItem(stockNumber: string): Promise<InventoryItem> {
  return publicApiGet<InventoryItem>(`/public/inventory/${encodeURIComponent(stockNumber)}`);
}
