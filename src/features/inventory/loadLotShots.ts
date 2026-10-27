import { getInventoryItem } from "../../api/inventory";
import { getPublicInventoryItem } from "../../api/publicInventory";
import { galleryShots, type VisCandidate } from "./visImages";

export function loadLotShots(stockNumber: string, mode: "public" | "app"): Promise<VisCandidate[]> {
  const request = mode === "public" ? getPublicInventoryItem(stockNumber) : getInventoryItem(stockNumber);
  return request.then((row) => galleryShots(row.gallery));
}
