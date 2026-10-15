"use client";

import { useState, useCallback, useEffect } from "react";
import {
  sendCopilotChat,
  deleteCopilotThread,
  fetchCopilotThreads,
  fetchCopilotThreadHistory,
  type MatchedVehicle,
} from "../../api/copilot";
import { getCurrentUser } from "../../auth/session";
import { sendPublicCopilotChat } from "../../api/publicCopilot";
import { SHOWCASE_INVENTORY } from "../../features/inventory/showcaseData";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  vehicles?: MatchedVehicle[];
  timestamp: number;
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = "fairsales_ai_threads_v1";
const GUEST_STORAGE_KEY = "fairsales_ai_guest_thread_v1";
const GUEST_INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface GuestSessionData {
  messages: ChatMessage[];
  lastActiveAt: number;
}

function loadGuestSession(): ChatMessage[] {
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

function persistGuestSession(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    const data: GuestSessionData = {
      messages,
      lastActiveAt: Date.now(),
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function clearGuestSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {}
}

// In-memory active session thread ID:
// - Persists during SPA route & tab navigation (e.g. moving between /app/inventory and /app/presets).
// - Naturally resets to null upon browser hard refresh (F5 / full page reload).
let inMemoryActiveThreadId: string | null = null;

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

/**
 * Signals that navigation was initiated from inside Copilot chat (e.g. clicking View Details or arrow).
 * This tells the chat system to preserve active state across the route transition and prevent auto-collapse.
 */
export function markChatNavigating(threadId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("fairsales_ai_navigating_from_chat", "true");
    sessionStorage.setItem("copilot_prevent_collapse", "true");
    const tid = threadId || inMemoryActiveThreadId;
    if (tid) {
      sessionStorage.setItem("fairsales_ai_active_redirect_thread", tid);
    }
  } catch {}
}

function getInitialActiveThreadId(): string | null {
  if (typeof window === "undefined") return null;

  // Rule: On browser refresh (F5 / reload), discard the active chat session
  if (isBrowserReload()) {
    try {
      sessionStorage.removeItem("fairsales_ai_navigating_from_chat");
      sessionStorage.removeItem("fairsales_ai_active_redirect_thread");
      sessionStorage.removeItem("fairscout_ai_navigating_from_chat");
      sessionStorage.removeItem("fairscout_ai_active_redirect_thread");
      sessionStorage.removeItem("copilot_prevent_collapse");
    } catch {}
    inMemoryActiveThreadId = null;
    return null;
  }

  // If navigating via chat redirect, recover the active thread ID
  try {
    const redirectThreadId =
      sessionStorage.getItem("fairsales_ai_active_redirect_thread") ||
      sessionStorage.getItem("fairscout_ai_active_redirect_thread");
    if (redirectThreadId) {
      inMemoryActiveThreadId = redirectThreadId;
      sessionStorage.removeItem("fairsales_ai_active_redirect_thread");
      sessionStorage.removeItem("fairscout_ai_active_redirect_thread");
      return redirectThreadId;
    }
  } catch {}

  return inMemoryActiveThreadId;
}

function loadSavedThreads(): ConversationThread[] {
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

function persistThreads(threads: ConversationThread[]) {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const valid = threads
      .filter((t) => !t.createdAt || now - t.createdAt < THIRTY_DAYS_MS)
      .slice(0, 20); // Keep last 20 active within 30 days
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
  } catch {}
}

export function useCopilotChat() {
  const [threads, setThreads] = useState<ConversationThread[]>(() => {
    if (typeof window !== "undefined" && !getCurrentUser()) return [];
    return loadSavedThreads();
  });
  
  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    if (typeof window !== "undefined" && !getCurrentUser()) return null;
    const tid = getInitialActiveThreadId();
    if (!tid) return null;
    const saved = loadSavedThreads();
    const found = saved.find((t) => t.id === tid);
    return found && found.messages && found.messages.length > 0 ? found.id : null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined" && !getCurrentUser()) {
      return loadGuestSession();
    }
    const tid = getInitialActiveThreadId();
    if (!tid) return [];
    const saved = loadSavedThreads();
    const found = saved.find((t) => t.id === tid);
    return found && found.messages && found.messages.length > 0 ? found.messages : [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state on client mount: on hard refresh discard, on chat redirect restore, and sync from DynamoDB cloud
  useEffect(() => {
    let isMounted = true;
    const isUser = Boolean(getCurrentUser());

    if (!isUser) {
      setThreads([]);
      if (isBrowserReload()) {
        clearGuestSession();
        setMessages([]);
      } else {
        const guest = loadGuestSession();
        setMessages(guest);
      }
      return () => {
        isMounted = false;
      };
    }

    const saved = loadSavedThreads();
    setThreads(saved);

    if (isBrowserReload()) {
      inMemoryActiveThreadId = null;
      setActiveThreadId(null);
      setMessages([]);
    } else {
      const tid = getInitialActiveThreadId();
      if (tid) {
        const found = saved.find((t) => t.id === tid);
        if (found && found.messages && found.messages.length > 0) {
          setActiveThreadId(found.id);
          setMessages(found.messages);
        }
      } else if (!inMemoryActiveThreadId) {
        setActiveThreadId(null);
        setMessages([]);
      }
    }

    // Full Cloud Sync: Fetch user's server-persisted threads from DynamoDB only if logged in
    fetchCopilotThreads(30)
      .then((serverThreads) => {
        if (!isMounted || !serverThreads || serverThreads.length === 0) return;
        const now = Date.now();
        // Defensive 30-day client cutoff matching backend
        const validServerThreads = serverThreads.filter((st) => {
          const threadTime = new Date(st.updatedAt || st.createdAt || now).getTime();
          return now - threadTime < THIRTY_DAYS_MS;
        });

        setThreads((prev) => {
          const localMap = new Map(prev.map((t) => [t.id, t]));
          const merged: ConversationThread[] = [];

          for (const st of validServerThreads) {
            const local = localMap.get(st.threadId);
            const threadTimestamp = new Date(st.createdAt || st.updatedAt || now).getTime();
            if (local) {
              merged.push({
                ...local,
                title: st.title || local.title,
                createdAt: local.createdAt || threadTimestamp,
              });
              localMap.delete(st.threadId);
            } else {
              merged.push({
                id: st.threadId,
                title: st.title || "Conversation",
                createdAt: threadTimestamp,
                messages: [],
              });
            }
          }
          // Preserve local threads not yet synced if within 30 days
          for (const local of localMap.values()) {
            if (!local.createdAt || now - local.createdAt < THIRTY_DAYS_MS) {
              merged.push(local);
            }
          }

          persistThreads(merged);
          return merged;
        });
      })
      .catch((err) => {
        console.warn("Cloud sync failed to fetch threads:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setLoading(true);
      setError(null);

      // =======================================================================
      // 1. Unauthenticated Guest: 30-min inactivity in localStorage, multi-turn
      // =======================================================================
      if (!getCurrentUser()) {
        try {
          const payload = updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          }));
          let response;
          try {
            response = await sendPublicCopilotChat(payload);
          } catch {
            const q = trimmed.toLowerCase();
            const matched = SHOWCASE_INVENTORY.filter((item) => {
              const str = `${item.year} ${item.make} ${item.model} ${item.bodyStyle} ${item.primaryDamage} ${item.fuelType}`.toLowerCase();
              return q.split(" ").some((w) => w.length > 2 && str.includes(w));
            });
            const topVehicles = matched.length > 0 ? matched.slice(0, 4) : SHOWCASE_INVENTORY.slice(0, 3);
            const carCards: MatchedVehicle[] = topVehicles.map((v) => ({
              stockNumber: v.stockNumber,
              title: v.title,
              year: v.year,
              make: v.make,
              model: v.model,
              currentBid: v.currentBid,
              acv: v.acv,
              spread: (v.acv || 0) - (v.currentBid || 0),
              primaryDamage: v.primaryDamage,
              imageUrl: v.imageUrl,
              auctionDate: v.auctionDate,
              branch: v.branch,
            }));
            const replyText = matched.length > 0
              ? `I found ${matched.length} live auction lots matching "${trimmed}". Here are top recommendations with inspection details below:`
              : `Here are our highest-rated live auction lots currently featured on the block. Sign in to place live bids or save custom watchlists!`;
            response = {
              reply: replyText,
              vehicles: carCards,
            };
          }

          const assistantMsg: ChatMessage = {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: response.reply || "Here are the top auction matches based on your criteria:",
            vehicles: response.vehicles || [],
            timestamp: Date.now(),
          };

          const finalMessages = [...updatedMessages, assistantMsg];
          setMessages(finalMessages);
          persistGuestSession(finalMessages);
        } catch (err: any) {
          console.error("FairSales guest request error:", err);
          setError(err.message || "Failed to scout inventory.");
          const errMsg: ChatMessage = {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Sorry, I had trouble searching inventory right now. Please try again or refine your query.",
            timestamp: Date.now(),
          };
          const finalMessages = [...updatedMessages, errMsg];
          setMessages(finalMessages);
          persistGuestSession(finalMessages);
        } finally {
          setLoading(false);
        }
        return;
      }

      // =======================================================================
      // 2. Authenticated User: DynamoDB persistence + thread management
      // =======================================================================
      let currentThreadId = activeThreadId;
      const isNewThread = !currentThreadId;
      if (isNewThread) {
        currentThreadId = `thread-${Date.now()}`;
        setActiveThreadId(currentThreadId);
      }
      inMemoryActiveThreadId = currentThreadId;

      const threadTitle =
        trimmed.length > 34 ? `${trimmed.slice(0, 34).trim()}…` : trimmed;

      try {
        const payload = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await sendCopilotChat(payload, currentThreadId);
        const resolvedThreadId = response.threadId || currentThreadId;
        if (resolvedThreadId && resolvedThreadId !== currentThreadId) {
          currentThreadId = resolvedThreadId;
          setActiveThreadId(resolvedThreadId);
          inMemoryActiveThreadId = resolvedThreadId;
        }

        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: response.reply || "Here are the top auction matches based on your criteria:",
          vehicles: response.vehicles || [],
          timestamp: Date.now(),
        };

        const finalMessages = [...updatedMessages, assistantMsg];
        setMessages(finalMessages);

        // Update threads list
        setThreads((prev) => {
          let nextThreads: ConversationThread[];
          if (isNewThread) {
            const newThread: ConversationThread = {
              id: currentThreadId!,
              title: threadTitle,
              createdAt: Date.now(),
              messages: finalMessages,
            };
            nextThreads = [newThread, ...prev];
          } else {
            nextThreads = prev.map((t) =>
              t.id === currentThreadId
                ? { ...t, messages: finalMessages }
                : t
            );
          }
          persistThreads(nextThreads);
          return nextThreads;
        });
      } catch (err: any) {
        console.error("FairSales request error:", err);
        setError(err.message || "Failed to scout inventory.");
        const errMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I had trouble searching inventory right now. Please try again or refine your query.",
          timestamp: Date.now(),
        };
        const finalMessages = [...updatedMessages, errMsg];
        setMessages(finalMessages);

        setThreads((prev) => {
          const next = isNewThread
            ? [
                {
                  id: currentThreadId!,
                  title: threadTitle,
                  createdAt: Date.now(),
                  messages: finalMessages,
                },
                ...prev,
              ]
            : prev.map((t) =>
                t.id === currentThreadId
                  ? { ...t, messages: finalMessages }
                  : t
              );
          persistThreads(next);
          return next;
        });
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, activeThreadId]
  );

  const startNewConversation = useCallback(() => {
    if (!getCurrentUser()) {
      clearGuestSession();
    }
    inMemoryActiveThreadId = null;
    setActiveThreadId(null);
    setMessages([]);
    setError(null);
  }, []);

  const switchThread = useCallback(
    async (threadId: string) => {
      const target = threads.find((t) => t.id === threadId);
      inMemoryActiveThreadId = threadId;
      setActiveThreadId(threadId);
      setError(null);

      if (target && target.messages && target.messages.length > 0) {
        setMessages(target.messages);
        return;
      }

      // Fetch from DynamoDB cloud if local messages not present
      try {
        const hist = await fetchCopilotThreadHistory(threadId);
        if (hist && hist.messages) {
          const loadedMsgs: ChatMessage[] = hist.messages.map((m: any) => ({
            id: m.messageId || m.id || `msg-${Math.random()}`,
            role: m.role,
            content: m.content || "",
            vehicles: m.vehicles || [],
            timestamp: m.timestamp || Date.now(),
          }));
          setMessages(loadedMsgs);
          setThreads((prev) => {
            const next = prev.map((t) =>
              t.id === threadId ? { ...t, messages: loadedMsgs } : t
            );
            persistThreads(next);
            return next;
          });
        }
      } catch (err: any) {
        console.warn("Failed to load thread history from cloud:", err);
      }
    },
    [threads]
  );

  const deleteThread = useCallback(
    (threadId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      deleteCopilotThread(threadId).catch(() => {});
      setThreads((prev) => {
        const next = prev.filter((t) => t.id !== threadId);
        persistThreads(next);
        return next;
      });
      if (activeThreadId === threadId) {
        inMemoryActiveThreadId = null;
        startNewConversation();
      }
    },
    [activeThreadId, startNewConversation]
  );

  return {
    messages,
    threads,
    activeThreadId,
    loading,
    error,
    sendMessage,
    startNewConversation,
    switchThread,
    deleteThread,
    resetChat: startNewConversation,
  };
}
