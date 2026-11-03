import { describe, expect, it } from "vitest";
import { DEFAULT_CARD_FIELDS, allCardFieldIds, formatCardValue } from "./cardFields";

describe("card fields", () => {
  it("defaults to the important sale-critical set", () => {
    expect(DEFAULT_CARD_FIELDS).toEqual([
      "primaryDamage",
      "secondaryDamage",
      "lossType",
      "vehicleType",
      "odometer",
      "airbags",
      "extColor",
      "intColor",
      "engine",
      "cylinders",
      "transmission",
      "fuelType",
      "bodyStyle",
    ]);
  });

  it("covers every customize-list field once", () => {
    const ids = allCardFieldIds();
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("primaryDamage");
    expect(ids).toContain("fuelType");
    expect(ids).not.toContain("stockNumber");
    expect(ids).not.toContain("titleDoc");
    expect(ids).not.toContain("vehicleScore");
    expect(ids).not.toContain("startCode");
    expect(ids).not.toContain("vin");
    expect(ids).not.toContain("year");
    expect(ids).not.toContain("branch");
    expect(ids).not.toContain("seller");
    expect(ids).not.toContain("acv");
    expect(ids).not.toContain("auctionDate");
    expect(ids).not.toContain("buyNowPrice");
    expect(ids).not.toContain("newInvTime");
    expect(ids).not.toContain("vehicleSubtype");
    expect(ids).not.toContain("laneRun");
    expect(ids).not.toContain("market");
    expect(ids).not.toContain("sellerType");
    expect(ids).not.toContain("region");
  });

  it("formats odometer and money", () => {
    expect(formatCardValue({ stockNumber: "1", odometer: 3402 }, "odometer")).toBe("3,402 mi");
    expect(formatCardValue({ stockNumber: "1", acv: 19889 }, "acv")).toBe("$19,889");
  });
});
