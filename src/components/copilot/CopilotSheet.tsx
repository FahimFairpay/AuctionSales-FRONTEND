"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent,
  type RefObject,
  type SetStateAction,
} from "react";
import type { ChatMessage, ConversationThread } from "./useCopilotChat";
import { getCurrentUser } from "../../auth/session";
import { BorderBeam } from "border-beam";
import { useConversationFeed } from "./useConversationFeed";
import { CopilotThoughtStream, CopilotVehicleCarousel, FluidWordCascade } from "./CopilotMessageParts";

/** Formats timestamps into relative time ("Just now", "2m ago", "1h ago", "Yesterday", "Sep 30") */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDays === 1) return "Yesterday";
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

/**
 * UI TOGGLE: Set to true to show the thread history dropdown menu in the header for signed-in users.
 */
export const SHOW_HEADER_DROPDOWN = true;


interface CopilotSheetProps {
  currentWidthClass: string;
  menuRef: RefObject<HTMLDivElement | null>;
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  onNewConversation: () => void;
  threads: ConversationThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string, event?: MouseEvent) => void;
  onClose: () => void;
  messages: ChatMessage[];
  loading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  publicGlass?: boolean;
}

export function CopilotSheet({
  currentWidthClass,
  menuRef,
  isMenuOpen,
  setIsMenuOpen,
  onNewConversation: handleNewConversationClick,
  threads,
  activeThreadId,
  onSelectThread: handleSelectThread,
  onDeleteThread: deleteThread,
  onClose: handleCloseChevron,
  messages,
  loading,
  messagesEndRef,
}: CopilotSheetProps) {
  const isUserLoggedIn = Boolean(getCurrentUser()) || threads.length > 0;
  const [completedTextMsgIds, setCompletedTextMsgIds] = useState<Set<string>>(() => new Set());
  const animatedCarouselsRef = useRef<Set<string>>(new Set());

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };
    checkTheme();
    const obs = new MutationObserver(checkTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const markTextCompleted = useCallback((id: string) => {
    setCompletedTextMsgIds((prev) => new Set(prev).add(id));
  }, []);

  const { feedRef, scrollable } = useConversationFeed(`${messages.length}:${loading ? 1 : 0}`);

  return (
    <BorderBeam
      size="md"
      colorVariant="mono"
      strength={0.7}
      theme={theme}
      active={true}
      borderRadius={isMobile ? 0 : 26}
      className="relative mb-3 max-sm:mb-0 max-sm:flex-1 max-sm:min-h-0 max-sm:w-full max-sm:flex max-sm:flex-col"
    >
      <div
        role="region"
        aria-label="FairSales Messenger"
        className={`copilot-public-sheet relative flex ${currentWidthClass} h-[520px] max-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-[26px] border animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all ease-out select-text text-[#141413] dark:text-[#f7f6f2] max-sm:mb-0 max-sm:flex-1 max-sm:h-full max-sm:w-full max-sm:max-h-none max-sm:rounded-none max-sm:border-0`}
      >
      {/* Optical Glare & Specular Refraction Overlay */}
      <div
        className="copilot-sheet-glare pointer-events-none absolute inset-0 z-0 opacity-0"
        style={{
          background: "var(--glass-drawer-glare)",
        }}
        aria-hidden="true"
      />

      {/* Header Bar */}
      <div
        className="copilot-public-header relative z-20 flex shrink-0 items-center justify-between border-b px-3.5 py-2.5 transition-all duration-300 max-sm:pt-[calc(env(safe-area-inset-top,0px)+12px)] max-sm:px-4"
        style={{
          backgroundColor: isMobile ? (theme === "dark" ? "#0d0e15" : "#ffffff") : "var(--glass-header-bg)",
          borderColor: "var(--glass-border-hairline)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
          color: "var(--ink)",
          transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header Brand: Dropdown for logged-in users vs Simple Clean Label for guests */}
        {SHOW_HEADER_DROPDOWN && isUserLoggedIn ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              className="flex items-center gap-2 rounded-xl px-2 py-1 -ml-1 hover:bg-white/15 dark:hover:bg-white/10 transition cursor-pointer"
              style={{ color: "var(--ink)" }}
              title="FairSales options"
            >
              {/* FS Avatar Badge */}
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-accent via-[#ce6e42] to-[#e88a59] text-white font-bold text-[11px] shadow-sm border border-white/20">
                FS
              </span>
              <span className="text-xs font-semibold tracking-tight">FairSales</span>
              {/* Downward Chevron */}
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                style={{ color: "var(--muted)" }}
                className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M4.00009 5.1499C4.22009 5.1499 4.44009 5.2299 4.60009 5.3999L8.00009 8.7999L11.4001 5.3999C11.7301 5.0699 12.2701 5.0699 12.6001 5.3999C12.9301 5.7299 12.9301 6.2699 12.6001 6.5999L8.00009 11.1999L3.40009 6.5999C3.07009 6.2699 3.07009 5.7299 3.40009 5.3999C3.57009 5.2299 3.78009 5.1499 4.00009 5.1499Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            {/* Fin AI Style Dropdown Menu (Solid opaque card, high contrast) */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 max-h-72 overflow-y-auto rounded-2xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 scrollbar-thin bg-white dark:bg-[#1a1b23] border-slate-200/90 dark:border-white/10"
                style={{
                  boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.25), 0 0 1px 1px rgba(0, 0, 0, 0.05)",
                  color: "var(--ink)",
                }}
              >
                {/* + New conversation action */}
                <button
                  type="button"
                  onClick={handleNewConversationClick}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-accent hover:text-white transition cursor-pointer text-slate-800 dark:text-slate-100"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-black/5 dark:bg-white/10 text-current text-xs font-bold">
                    +
                  </span>
                  <span>New conversation</span>
                </button>

                <div
                  className="my-1.5 border-t border-slate-100 dark:border-white/10"
                />

                {/* Convo History Section (last 30 days) */}
                <div
                  className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400"
                >
                  Recent Conversations
                </div>

                {threads.length === 0 ? (
                  <div
                    className="px-3 py-2 text-[11px] italic text-slate-400 dark:text-slate-400"
                  >
                    No past conversations yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {threads.map((t) => {
                      const isActive = t.id === activeThreadId;
                      return (
                        <div
                          key={t.id}
                          className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition cursor-pointer ${
                            isActive
                              ? "bg-accent/15 text-accent font-semibold"
                              : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200"
                          }`}
                          onClick={() => handleSelectThread(t.id)}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="truncate text-xs font-medium leading-snug">
                              {t.title || "New Conversation"}
                            </p>
                            <span
                              className="text-[10px] tabular-nums block mt-0.5 text-slate-400 dark:text-slate-400"
                            >
                              {formatRelativeTime(t.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isActive && (
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-xs" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteThread(t.id, e);
                              }}
                              title="Delete conversation"
                              aria-label="Delete conversation"
                              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-500/10 dark:text-slate-400 dark:hover:text-red-400 transition cursor-pointer"
                            >
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Simple Brand Label for Guests */
          <div className="flex items-center gap-2 px-1 select-none">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-accent via-[#ce6e42] to-[#e88a59] text-white font-bold text-[11px] shadow-sm border border-white/20">
              FS
            </span>
            <span className="text-xs font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
              FairSales
            </span>
          </div>
        )}

        {/* Right Header Actions: New Chat '+' for Guests & Close Down-Chevron */}
        <div className="flex items-center gap-1">
          {!isUserLoggedIn && (
            <button
              type="button"
              onClick={handleNewConversationClick}
              aria-label="New conversation"
              className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
              style={{ color: "var(--muted)" }}
              title="Start new conversation"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2z" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={handleCloseChevron}
            aria-label="Close"
            className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
            style={{ color: "var(--muted)" }}
            title="Close"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M4.00009 5.1499C4.22009 5.1499 4.44009 5.2299 4.60009 5.3999L8.00009 8.7999L11.4001 5.3999C11.7301 5.0699 12.2701 5.0699 12.6001 5.3999C12.9301 5.7299 12.9301 6.2699 12.6001 6.5999L8.00009 11.1999L3.40009 6.5999C3.07009 6.2699 3.07009 5.7299 3.40009 5.3999C3.57009 5.2299 3.78009 5.1499 4.00009 5.1499Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversation Feed */}
      <div
        ref={feedRef}
        className={`copilot-feed relative z-10 min-h-0 flex-1 ${scrollable ? "is-scrollable" : ""}`}
      >
        <div className="copilot-feed-inner p-3.5 space-y-3.5">
        {messages.length === 0 ? (
          /* Clean, translucent prompt invitation when in a fresh new conversation */
          <div className="flex h-full flex-col items-center justify-center text-center px-4 py-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent font-bold text-xs mb-2.5 shadow-sm border border-white/20">
              FS
            </span>
            <p className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
              New FairSales Session
            </p>
            <p
              className="mt-1 text-[11px] max-w-[260px] leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Type below to scout inventory by make, damage, auction location, or margin.
            </p>
          </div>
        ) : (
          messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex flex-col items-end gap-1">
                {/* User Message Bubble */}
                <div
                  className="copilot-public-bubble max-w-[86%] px-4 py-2.5 text-xs leading-relaxed rounded-[20px] rounded-br-[4px] border transition-all duration-300"
                  style={{
                    background: "var(--glass-user-bubble-bg)",
                    border: "var(--glass-user-bubble-border)",
                    boxShadow: "var(--glass-user-bubble-shadow)",
                    color: "var(--ink)",
                    backdropFilter: "blur(24px) saturate(190%)",
                    WebkitBackdropFilter: "blur(24px) saturate(190%)",
                    transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s ease",
                  }}
                >
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                </div>

                {/* User Receipt */}
                <span
                  className="mr-1 text-[10px] tabular-nums font-medium text-[#64748b] dark:text-[#94a3b8]"
                >
                  You • {formatRelativeTime(msg.timestamp)}
                </span>
              </div>
            ) : (() => {
              const isLatestAssistant = messages[messages.length - 1]?.id === msg.id;
              const isLiveFresh = isLatestAssistant && Date.now() - msg.timestamp < 12000;
              const isTextDone = !isLiveFresh || completedTextMsgIds.has(msg.id);
              const isStreaming = isLiveFresh && !completedTextMsgIds.has(msg.id);
              const hasAnimated = animatedCarouselsRef.current.has(msg.id);
              const shouldAnimateCards = isLiveFresh && isTextDone && !hasAnimated;

              return (
                <div key={msg.id} className="flex flex-col items-start gap-2 w-full">
                  {/* Agent Header Row */}
                  <div
                    className="flex items-center gap-1.5 px-0.5 text-[11px] font-semibold text-[#475569] dark:text-[#94a3b8] select-none"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
                    <span>FairSales • {formatRelativeTime(msg.timestamp)}</span>
                  </div>

                  {/* Agent Message Prose Bubble */}
                  <div
                    className="copilot-public-bubble max-w-[92%] px-4 py-3 text-xs leading-relaxed rounded-[20px] rounded-tl-[4px] border transition-all duration-300"
                    style={{
                      background: "var(--glass-card-bg)",
                      border: "var(--glass-card-border)",
                      boxShadow: "var(--glass-card-shadow)",
                      color: "var(--ink)",
                      backdropFilter: "blur(24px) saturate(190%)",
                      WebkitBackdropFilter: "blur(24px) saturate(190%)",
                      transition: "background 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.45s ease, box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s ease",
                    }}
                  >
                    <FluidWordCascade
                      content={msg.content}
                      isStreaming={isStreaming}
                      onComplete={() => markTextCompleted(msg.id)}
                    />
                  </div>

                  {/* Curated Horizontal Snap Carousel: Sequential display only AFTER text is completed */}
                  {msg.vehicles && msg.vehicles.length > 0 && isTextDone && (
                    <CopilotVehicleCarousel
                      vehicles={msg.vehicles}
                      animate={shouldAnimateCards}
                      onAnimateDone={() => animatedCarouselsRef.current.add(msg.id)}
                    />
                  )}
                </div>
              );
            })()
          )
        )}

        {/* Thought Stream with Step Cycling & Skeletons */}
        {loading && <CopilotThoughtStream />}

        <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
    </BorderBeam>
  );
}
