import type { CardFieldId } from "./cardFields";
import { fieldLabel, formatCardValue } from "./cardFields";
import type { InventoryItem } from "../../types/api";

export type DisplayTopicId = "vehicle" | "condition" | "build" | "sale";

export type DisplayTopic = {
  id: DisplayTopicId;
  label: string;
  fields: CardFieldId[];
};

export const DISPLAY_TOPICS: DisplayTopic[] = [
  {
    id: "vehicle",
    label: "Vehicle",
    fields: ["primaryDamage", "secondaryDamage", "lossType", "vehicleType"],
  },
  {
    id: "condition",
    label: "Condition",
    fields: ["odometer", "airbags", "keyStatus", "extColor", "intColor"],
  },
  {
    id: "build",
    label: "Build data",
    fields: ["engine", "fuelType", "cylinders", "transmission", "drivelineType", "bodyStyle", "countryOfOrigin"],
  },
  {
    id: "sale",
    label: "Sale info",
    fields: [],
  },
];

const LABELED = new Set<CardFieldId>(["acv"]);

export function visibleTopics(selected: CardFieldId[]): DisplayTopic[] {
  const on = new Set(selected);
  return DISPLAY_TOPICS.filter(
    (topic) => topic.id === "vehicle" || topic.id === "sale" || topic.fields.some((id) => on.has(id)),
  ).map(
    (topic) => ({
      ...topic,
      fields: topic.fields.filter((id) => on.has(id)),
    }),
  );
}

export function formatFactLine(item: InventoryItem, id: CardFieldId): string | null {
  const text = formatCardValue(item, id);
  if (text === "—") {
    return null;
  }
  if (id === "buyNowPrice") {
    return `Buy now ${text}`;
  }
  if (!LABELED.has(id)) {
    return text;
  }
  const label = fieldLabel(id);
  if (id === "vin" || id === "acv") {
    return `${label} · ${text}`;
  }
  return `${label}: ${text}`;
}
