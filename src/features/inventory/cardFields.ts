import type { InventoryItem } from "../../types/api";

export type CardFieldId =
  | "stockNumber"
  | "titleDoc"
  | "primaryDamage"
  | "secondaryDamage"
  | "lossType"
  | "newInvTime"
  | "vehicleType"
  | "vehicleSubtype"
  | "odometer"
  | "startCode"
  | "airbags"
  | "keyStatus"
  | "extColor"
  | "intColor"
  | "engine"
  | "fuelType"
  | "cylinders"
  | "vin"
  | "transmission"
  | "drivelineType"
  | "bodyStyle"
  | "countryOfOrigin"
  | "branch"
  | "laneRun"
  | "market"
  | "seller"
  | "sellerType"
  | "acv"
  | "region"
  | "year"
  | "vehicleScore"
  | "auctionDate"
  | "buyNowPrice";

export type CardField = { id: CardFieldId; label: string };
export type CardGroup = { id: string; label: string; fields: CardField[] };

export const CARD_GROUPS: CardGroup[] = [
  {
    id: "vehicle",
    label: "Vehicle",
    fields: [
      { id: "primaryDamage", label: "Primary Damage" },
      { id: "secondaryDamage", label: "Secondary Damage" },
      { id: "lossType", label: "Loss Type" },
      { id: "vehicleType", label: "Vehicle Type" },
    ],
  },
  {
    id: "condition",
    label: "Condition",
    fields: [
      { id: "odometer", label: "Odometer" },
      { id: "airbags", label: "Airbags" },
      { id: "keyStatus", label: "Key" },
      { id: "extColor", label: "Exterior Color" },
      { id: "intColor", label: "Interior Color" },
    ],
  },
  {
    id: "build",
    label: "Build data",
    fields: [
      { id: "engine", label: "Engine" },
      { id: "fuelType", label: "Fuel Type" },
      { id: "cylinders", label: "Cylinders" },
      { id: "transmission", label: "Transmission" },
      { id: "drivelineType", label: "Drive Line Type" },
      { id: "bodyStyle", label: "Body Style" },
      { id: "countryOfOrigin", label: "Country of Origin" },
    ],
  },
  {
    id: "sale",
    label: "Sale info",
    fields: [],
  },
];

export const DEFAULT_CARD_FIELDS: CardFieldId[] = [
  "primaryDamage",
  "secondaryDamage",
  "odometer",
  "airbags",
  "extColor",
  "intColor",
  "engine",
  "cylinders",
  "transmission",
  "fuelType",
];

const STORAGE_KEY = "fps-card-fields-v2";

export function allCardFieldIds(): CardFieldId[] {
  return CARD_GROUPS.flatMap((group) => group.fields.map((field) => field.id));
}

export function loadCardFields(): CardFieldId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [...DEFAULT_CARD_FIELDS];
    }
    const parsed = JSON.parse(raw) as string[];
    const allowed = new Set(allCardFieldIds());
    const next = parsed.filter((id): id is CardFieldId => allowed.has(id as CardFieldId));
    return next.length > 0 ? next : [...DEFAULT_CARD_FIELDS];
  } catch {
    return [...DEFAULT_CARD_FIELDS];
  }
}

export function saveCardFields(ids: CardFieldId[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function money(value?: number): string {
  if (value == null) {
    return "—";
  }
  return `$${value.toLocaleString("en-US")}`;
}

export function formatCardValue(item: InventoryItem, id: CardFieldId): string {
  switch (id) {
    case "stockNumber":
      return item.stockNumber || "—";
    case "year":
      return item.year != null ? String(item.year) : "—";
    case "odometer":
      return item.odometer != null ? `${item.odometer.toLocaleString("en-US")} mi` : "—";
    case "vehicleScore":
      return item.vehicleScore != null ? String(item.vehicleScore) : "—";
    case "acv":
      return money(item.acv);
    case "buyNowPrice":
      return money(item.buyNowPrice);
    default: {
      const raw = item[id];
      if (raw == null || raw === "") {
        return "—";
      }
      return String(raw);
    }
  }
}

export function fieldLabel(id: CardFieldId): string {
  for (const group of CARD_GROUPS) {
    const hit = group.fields.find((field) => field.id === id);
    if (hit) {
      return hit.label;
    }
  }
  return id;
}
