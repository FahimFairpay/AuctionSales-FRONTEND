import { describe, expect, it } from "vitest";
import { DISPLAY_TOPICS, formatFactLine, visibleTopics } from "./displayTopics";
import { DEFAULT_CARD_FIELDS } from "./cardFields";

describe("display topics", () => {
  it("keeps Vehicle even when no vehicle fields are selected", () => {
    const topics = visibleTopics(["odometer"]);
    expect(topics.map((topic) => topic.id)).toEqual(["vehicle", "condition", "sale"]);
    expect(topics[0].fields).toEqual([]);
  });

  it("shows Build when a build field is on", () => {
    const topics = visibleTopics([...DEFAULT_CARD_FIELDS]);
    expect(topics.map((topic) => topic.id)).toEqual(["vehicle", "condition", "build", "sale"]);
    expect(topics.find((topic) => topic.id === "vehicle")?.fields).toEqual([
      "primaryDamage",
      "secondaryDamage",
      "lossType",
      "vehicleType",
    ]);
    expect(topics.find((topic) => topic.id === "build")?.fields).toEqual([
      "engine",
      "fuelType",
      "cylinders",
      "transmission",
      "bodyStyle",
    ]);
  });

  it("labels Buy now", () => {
    expect(formatFactLine({ stockNumber: "1", buyNowPrice: 1200 }, "buyNowPrice")).toBe("Buy now $1,200");
  });

  it("covers the four inventory topic groups", () => {
    expect(DISPLAY_TOPICS.map((topic) => topic.label)).toEqual([
      "Vehicle",
      "Condition",
      "Build data",
      "Sale info",
    ]);
  });
});
