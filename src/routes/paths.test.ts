import { describe, expect, it } from "vitest";
import { paths, recipeRedirectTo } from "./paths";

describe("historyLog", () => {
  it("puts logId in the query so # is not a hash fragment", () => {
    const href = paths.historyLog("exec#watchlist", "2026-09-21");
    expect(href.startsWith("/app/history?")).toBe(true);
    expect(href.includes("#")).toBe(false);
    const params = new URLSearchParams(href.slice(href.indexOf("?") + 1));
    expect(params.get("log")).toBe("exec#watchlist");
    expect(params.get("date")).toBe("2026-09-21");
  });
});

describe("inventory paths", () => {
  it("encodes stock numbers", () => {
    expect(paths.inventoryItem("12 3")).toBe("/app/inventory/12%203");
    expect(paths.publicInventoryItem("12 3")).toBe("/inventory/12%203");
    expect(paths.inventory).toBe("/app/inventory");
    expect(paths.publicInventory).toBe("/inventory");
  });
});

describe("fairental paths", () => {
  it("encodes the VIN", () => {
    expect(paths.fairentalItem("1HG CM")).toBe("/car-sales/1HG%20CM");
    expect(paths.adminFairentalItem("1HG CM")).toBe("/admin/car-sales/1HG%20CM");
  });
});

describe("recipe redirect", () => {
  it("sends settings bookmarks toward crawler runs", () => {
    expect(paths.adminSettings).toBe("/admin/settings");
    expect(recipeRedirectTo()).toBe("/admin/schedules");
  });
});

