import { describe, expect, it } from "vitest";
import { paths, signInWithNext } from "../routes/paths";

describe("Route Paths and Compatibility Router", () => {
  it("formats dynamic route URLs correctly", () => {
    expect(paths.inventoryItem("12345")).toBe("/app/inventory/12345");
    expect(paths.preset("abc-123")).toBe("/app/presets/abc-123");
    expect(paths.presetEdit("abc-123")).toBe("/app/presets/abc-123/edit");
    expect(paths.adminUser("usr-1")).toBe("/admin/users/usr-1");
    expect(paths.adminCrawler).toBe("/admin/schedules");
    expect(paths.adminCrawlerRun("crawl-99")).toBe("/admin/schedules/crawl-99");
    expect(paths.adminSettings).toBe("/admin/settings");
    expect(paths.adminRecipe).toBe("/admin/settings");
  });

  it("handles historyLog query parameter construction", () => {
    expect(paths.historyLog("log-1", "2026-09-28")).toBe(
      "/app/history?log=log-1&date=2026-09-28"
    );
    expect(paths.historyLog("log-2")).toBe("/app/history?log=log-2");
  });

  it("generates signInWithNext with encoded return destination", () => {
    expect(signInWithNext("/app/inventory?q=bmw")).toBe(
      "/sign-in?next=%2Fapp%2Finventory%3Fq%3Dbmw"
    );
  });
});
