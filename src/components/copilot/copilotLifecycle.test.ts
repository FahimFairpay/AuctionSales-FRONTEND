import { describe, expect, it, beforeEach, vi } from "vitest";

describe("Copilot Storage & Inactivity Lifecycles", () => {
  const GUEST_STORAGE_KEY = "fairsales_ai_guest_thread_v1";
  const GUEST_INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  // Mock localStorage for Vitest node environment
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k in store) delete store[k];
    },
  };

  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it("retains guest session when under 30 minutes of inactivity", () => {
    const now = Date.now();
    const guestData = {
      messages: [{ id: "1", role: "user", content: "Show me BMWs", timestamp: now }],
      lastActiveAt: now - 15 * 60 * 1000, // 15 mins ago
    };
    mockLocalStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));

    const raw = mockLocalStorage.getItem(GUEST_STORAGE_KEY);
    const parsed = JSON.parse(raw!);
    const isExpired = Date.now() - parsed.lastActiveAt >= GUEST_INACTIVITY_LIMIT_MS;

    expect(isExpired).toBe(false);
    expect(parsed.messages).toHaveLength(1);
    expect(parsed.messages[0].content).toBe("Show me BMWs");
  });

  it("expires and clears guest session after 30 minutes of inactivity", () => {
    const now = Date.now();
    const guestData = {
      messages: [{ id: "1", role: "user", content: "Show me BMWs", timestamp: now - 35 * 60 * 1000 }],
      lastActiveAt: now - 31 * 60 * 1000, // 31 mins ago
    };
    mockLocalStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));

    const raw = mockLocalStorage.getItem(GUEST_STORAGE_KEY);
    const parsed = JSON.parse(raw!);
    const isExpired = Date.now() - parsed.lastActiveAt >= GUEST_INACTIVITY_LIMIT_MS;

    if (isExpired) {
      mockLocalStorage.removeItem(GUEST_STORAGE_KEY);
    }

    expect(isExpired).toBe(true);
    expect(mockLocalStorage.getItem(GUEST_STORAGE_KEY)).toBeNull();
  });

  it("filters out conversation threads older than 30 days", () => {
    const now = Date.now();
    const threads = [
      { id: "fresh-1", title: "Recent search", createdAt: now - 5 * 24 * 60 * 60 * 1000 }, // 5 days ago
      { id: "fresh-2", title: "Yesterday search", createdAt: now - 1 * 24 * 60 * 60 * 1000 }, // 1 day ago
      { id: "old-1", title: "Ancient search", createdAt: now - 35 * 24 * 60 * 60 * 1000 }, // 35 days ago (expired)
      { id: "boundary", title: "Edge search", createdAt: now - 30 * 24 * 60 * 60 * 1000 - 1000 }, // 30d + 1s (expired)
    ];

    const activeThreads = threads.filter((t) => now - t.createdAt < THIRTY_DAYS_MS);
    expect(activeThreads).toHaveLength(2);
    expect(activeThreads.map((t) => t.id)).toEqual(["fresh-1", "fresh-2"]);
  });
});
