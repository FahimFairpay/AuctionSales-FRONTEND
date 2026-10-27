import { describe, expect, it } from "vitest";
import { inventoryFacetCount, inventoryHasFilters, inventoryLoadedCount, PAGE_SIZES, parseInventorySearch, toInventorySearch } from "./query";

describe("inventory query", () => {
  it("round-trips list filters and page size", () => {
    const parsed = parseInventorySearch("?limit=50&q=kia&vehicleTypes=SUVs,Automobiles&yearMin=2023");
    expect(parsed.limit).toBe(50);
    expect(parsed.modelContains).toBe("kia");
    expect(parsed.vehicleTypes).toEqual(["SUVs", "Automobiles"]);
    expect(parsed.yearMin).toBe("2023");
    const next = toInventorySearch({ ...parsed, cursor: "abc" }, false);
    expect(next.get("cursor")).toBeNull();
    expect(next.get("vehicleTypes")).toBe("SUVs,Automobiles");
  });

  it("clamps invalid limit to 25", () => {
    expect(parseInventorySearch("?limit=7").limit).toBe(25);
  });

  it("serializes one page at a time without a load-more cursor", () => {
    const first = toInventorySearch({ limit: 25 }, true);
    expect(first.get("cursor")).toBeNull();
    const next = toInventorySearch({ limit: 50, cursor: "page-2" }, false);
    expect(next.get("cursor")).toBeNull();
    expect(next.get("limit")).toBe("50");
  });

  it("treats search and range chips as active filters", () => {
    expect(inventoryHasFilters({ limit: 25 })).toBe(false);
    expect(inventoryHasFilters({ limit: 25, modelContains: "kia" })).toBe(true);
    expect(inventoryHasFilters({ limit: 25, yearMin: "2020" })).toBe(true);
  });

  it("counts facets without the search box", () => {
    expect(inventoryFacetCount({ limit: 25, modelContains: "kia" })).toBe(0);
    expect(inventoryFacetCount({ limit: 25, vehicleTypes: ["SUVs"], yearMin: "2020" })).toBe(2);
    expect(inventoryFacetCount({ limit: 25, source: "COPART" })).toBe(1);
    expect(inventoryFacetCount({ limit: 25, source: "ALL" })).toBe(0);
  });

  it("counts the rows each page actually returned", () => {
    expect(inventoryLoadedCount([61])).toBe(61);
    expect(inventoryLoadedCount([61, 100])).toBe(161);
    expect(inventoryLoadedCount([100, 100, 100])).toBe(300);
    expect(inventoryLoadedCount([100, 100, 40])).toBe(240);
    expect(inventoryLoadedCount([])).toBe(0);
  });

  it("exposes 25 50 100 and drops the cursor when page size changes", () => {
    expect(PAGE_SIZES).toEqual([10, 25, 50, 100]);
    const next = toInventorySearch({ limit: 100, cursor: "page-2", yearMin: "2020" }, false);
    expect(next.get("cursor")).toBeNull();
    expect(next.get("limit")).toBe("100");
  });

  it("parses and serializes multi-source auction filters (IAAI / COPART / ALL)", () => {
    const copartParsed = parseInventorySearch("?limit=25&source=copart");
    expect(copartParsed.source).toBe("COPART");
    const copartSearch = toInventorySearch(copartParsed);
    expect(copartSearch.get("source")).toBe("COPART");

    const iaaiParsed = parseInventorySearch("?limit=25&source=iaai");
    expect(iaaiParsed.source).toBe("IAAI");
    const iaaiSearch = toInventorySearch(iaaiParsed);
    expect(iaaiSearch.get("source")).toBe("IAAI");

    const allParsed = parseInventorySearch("?limit=25&source=ALL");
    expect(allParsed.source).toBe("ALL");
    const allSearch = toInventorySearch(allParsed);
    expect(allSearch.get("source")).toBeNull(); // Omitted when ALL to keep URLs clean
  });
});
