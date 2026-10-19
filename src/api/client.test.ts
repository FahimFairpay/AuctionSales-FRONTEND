import { beforeEach, describe, expect, it, vi } from "vitest";
import { getIdToken } from "../auth/session";
import { apiRequest } from "./client";

vi.mock("../auth/session", () => ({
  getIdToken: vi.fn(),
  signOut: vi.fn(),
}));

describe("apiRequest", () => {
  beforeEach(() => {
    vi.mocked(getIdToken).mockResolvedValue("raw-id-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
        text: async () => JSON.stringify({ success: true, data: { ok: true } }),
      }),
    );
  });

  it("sends the raw IdToken, not Bearer", async () => {
    await apiRequest("/users/me");
    const call = vi.mocked(fetch).mock.calls[0];
    const headers = new Headers(call[1]?.headers);
    expect(headers.get("Authorization")).toBe("raw-id-token");
    expect(headers.get("Authorization")?.startsWith("Bearer ")).toBe(false);
    expect(headers.get("X-Fair-Token")).toBe("raw-id-token");
  });
});
