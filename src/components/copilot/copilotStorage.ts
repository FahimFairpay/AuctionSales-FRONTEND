"use client";

import type { ChatMessage, ConversationThread } from "./copilotTypes";

const STORAGE_KEY = "fairsales_ai_threads_v1";
const GUEST_STORAGE_KEY = "fairsales_ai_guest_thread_v1";
const GUEST_INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

interface GuestSessionData {
  messages: ChatMessage[];
  lastActiveAt: number;
}

export function loadGuestSession(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(GUEST_STORAGE_KEY) ||
      localStorage.getItem("fairscout_ai_guest_thread_v1");
    if (!raw) return [];
    const parsed: GuestSessionData = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.messages) && typeof parsed.lastActiveAt === "number") {
      if (Date.now() - parsed.lastActiveAt < GUEST_INACTIVITY_LIMIT_MS) {
        return parsed.messages;
      }
    }
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem("fairscout_ai_guest_thread_v1");
    return [];
  } catch {
    return [];
  }
}

export function persistGuestSession(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    const data: GuestSessionData = {
      messages,
      lastActiveAt: Date.now(),
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearGuestSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {}
}

export function isBrowserReload(): boolean {
  if (typeof window === "undefined" || typeof performance === "undefined") return false;
  // If navigating via chat redirect, this is explicitly a route navigation, NOT a reload
  try {
    if (sessionStorage.getItem("fairsales_ai_navigating_from_chat") === "true") {
      return false;
    }
  } catch {}
  try {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === "reload";
    }
    return (performance as any).navigation?.type === 1;
  } catch {
    return false;
  }
}

export function loadSavedThreads(): ConversationThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem("fairscout_ai_threads_v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    // 30-day filter for thread history
    return parsed.filter((t: ConversationThread) => !t.createdAt || now - t.createdAt < THIRTY_DAYS_MS);
  } catch {
    return [];
  }
}

export function persistThreads(threads: ConversationThread[]) {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const valid = threads
      .filter((t) => !t.createdAt || now - t.createdAt < THIRTY_DAYS_MS)
      .slice(0, 20); // Keep last 20 active within 30 days
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  } catch {}
}
