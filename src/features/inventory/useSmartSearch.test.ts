import { describe, expect, it } from "vitest";
import { reconcileSearchDraft } from "./useSmartSearch";

describe("search draft", () => {
  it("keeps a letter typed after the committed prefix", () => {
    expect(reconcileSearchDraft("hybi", "hyb")).toBe("hybi");
  });

  it("keeps a trailing space", () => {
    expect(reconcileSearchDraft("hyb ", "hyb")).toBe("hyb ");
  });

  it("keeps a deletion that has not been committed yet", () => {
    expect(reconcileSearchDraft("hy", "hyb")).toBe("hy");
  });

  it("adopts a different query from outside the box", () => {
    expect(reconcileSearchDraft("hyb", "camry")).toBe("camry");
  });
});
