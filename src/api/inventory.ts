import type { InventoryItem, InventoryPage, FavoriteItem, ToggleFavoriteResponse } from "../types/api";
import { apiGet, apiSend } from "./client";
import type { InventoryQuery } from "../features/inventory/query";
import { toInventoryApiSearch } from "../features/inventory/query";

export function listInventory(query: InventoryQuery): Promise<InventoryPage> {
  const suffix = toInventoryApiSearch(query).toString();
  return apiGet<InventoryPage>(suffix ? `/inventory?${suffix}` : "/inventory");
}

export function smartSearchInventory(query: InventoryQuery & { q?: string }): Promise<InventoryPage> {
  const params = toInventoryApiSearch(query);
  if (query.q) {
    params.set("modelContains", query.q);
  }
  const suffix = params.toString();
  return apiGet<InventoryPage>(suffix ? `/inventory?${suffix}` : "/inventory");
}

export function getInventoryItem(stockNumber: string): Promise<InventoryItem> {
  return apiGet<InventoryItem>(`/inventory/${encodeURIComponent(stockNumber)}`);
}

export function listFavorites(): Promise<{ items: FavoriteItem[] }> {
  return apiGet<{ items: FavoriteItem[] }>("/inventory/favorites");
}

export function toggleFavorite(
  stockNumber: string,
  lotData?: Partial<FavoriteItem>
): Promise<ToggleFavoriteResponse> {
  return apiSend<ToggleFavoriteResponse>(
    `/inventory/${encodeURIComponent(stockNumber)}/favorite`,
    "POST",
    lotData || {}
  );
}
