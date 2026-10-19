"use client";

import React, { forwardRef, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "@/compat/router";
import { useCopilotChat } from "./useCopilotChat";
import { CopilotComposer } from "./CopilotComposer";
import { CopilotSheet } from "./CopilotSheet";
import { usePublicDockReveal, type CopilotDrawerHandle } from "./usePublicDockReveal";
import "./public-dock.css";

export { SHOW_HEADER_DROPDOWN } from "./CopilotSheet";

interface CopilotDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  /** Landing and public inventory. Signed-in app leaves this off. */
  publicDock?: boolean;
  /** Landing hero only. Inventory pages stay visible. */
  hideUntilScroll?: boolean;
}

export type { CopilotDrawerHandle };

const TYPEWRITER_PHRASES = [
  "Ask FairSales anything...",
  "Search auction inventory...",
  "What car are you seeking?",
  "Ask about repairs & savings...",
];

export const CopilotDrawer = forwardRef<CopilotDrawerHandle, CopilotDrawerProps>(function CopilotDrawer(
  { isOpen, onClose, onOpen, publicDock = false, hideUntilScroll = false },
  ref,
) {
  const {
    messages,
    threads,
    activeThreadId,
    loading,
    sendMessage,
    startNewConversation,
    switchThread,
    deleteThread,
  } = useCopilotChat();

  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isTypingOrFocused = isFocused || input.trim().length > 0;
  const hasVehicles = useMemo(() => messages.some((m) => m.vehicles && m.vehicles.length > 0), [messages]);
  const currentWidthClass = isExpanded
    ? (hasVehicles
        ? "w-[480px] max-w-[calc(100vw-24px)] max-sm:w-full max-sm:max-w-none"
        : "w-[450px] max-w-[calc(100vw-24px)] max-sm:w-full max-sm:max-w-none")
    : isTypingOrFocused
      ? "w-[calc((100vw-24px)*0.82)] min-w-[290px] sm:w-[420px] max-w-[450px]"
      : "w-[calc((100vw-24px)*0.63)] min-w-[216px] sm:w-[320px] max-w-[360px]";

  // Typewriter placeholder state
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const askFromOutside = useCallback((text: string) => {
    setIsExpanded(true);
    if (onOpen) onOpen();
    sendMessage(text);
  }, [onOpen, sendMessage]);
  const dockVisibility = usePublicDockReveal(
    Boolean(publicDock && hideUntilScroll),
    inputRef,
    ref,
    askFromOutside,
  );
  const dockHidden = dockVisibility.footerHidden || (dockVisibility.heroHidden && !isExpanded);

  // Active ongoing conversation exists if there are messages in current thread
  const hasActiveConversation = useMemo(
    () => messages.length > 0,
    [messages]
  );

  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);

  // Sync external isOpen prop if provided
  useEffect(() => {
    if (isOpen !== undefined) {
      setIsExpanded(isOpen);
    }
  }, [isOpen]);

  // Freeze background page scroll when AI Chat answer area is expanded full-screen on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth <= 640;
    if (isExpanded && isMobile) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isExpanded]);

  // The answer sheet stays up across scroll and route changes.
  // A car-card arrow (or View Details) sets this flag, then opens the car page.
  useEffect(() => {
    if (prevPathnameRef.current === location.pathname) return;
    prevPathnameRef.current = location.pathname;
    const openedCar =
      typeof window !== "undefined" && sessionStorage.getItem("copilot_prevent_collapse") === "true";
    if (!openedCar) return;
    try {
      sessionStorage.removeItem("copilot_prevent_collapse");
    } catch {}
    setIsExpanded(false);
    if (onClose) onClose();
  }, [location.pathname, onClose]);

  // Keep the latest message in the feed. Scroll the feed only — never the page.
  useEffect(() => {
    if (!isExpanded) return;
    const feed = messagesEndRef.current?.closest(".copilot-feed");
    if (!(feed instanceof HTMLElement) || !feed.classList.contains("is-scrollable")) return;
    feed.scrollTop = feed.scrollHeight;
  }, [messages, isExpanded]);

  // Close header conversation menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Typewriter animation loop: holds each phrase for 14 seconds
  useEffect(() => {
    if (input.length > 0 || isFocused) return;

    const currentPhrase = TYPEWRITER_PHRASES[phraseIdx];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIdx < currentPhrase.length) {
      timeout = setTimeout(() => {
        setCharIdx((prev) => prev + 1);
      }, 45);
    } else if (!isDeleting && charIdx === currentPhrase.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 14000);
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setCharIdx((prev) => prev - 1);
      }, 25);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, phraseIdx, input, isFocused]);

  const animatedPlaceholder = useMemo(() => {
    if (input) return "";
    return TYPEWRITER_PHRASES[phraseIdx].slice(0, charIdx);
  }, [phraseIdx, charIdx, input]);

  // Submit / Send handler: ONLY top arrow or Enter opens the answer chat display area
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (publicDock && !trimmed) return;
    setIsExpanded(true);
    if (onOpen) onOpen();

    if (trimmed && !loading) {
      sendMessage(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Close chevron handler:
  // If active conversation exists -> collapses to "Continue conversation" pill
  // If empty conversation -> collapses to initial resting input pill
  const handleCloseChevron = () => {
    setIsExpanded(false);
    setIsMenuOpen(false);
    if (onClose) onClose();
  };

  // Reset / New conversation handler
  const handleNewConversationClick = () => {
    startNewConversation();
    setIsMenuOpen(false);
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleSelectThread = (threadId: string) => {
    switchThread(threadId);
    setIsMenuOpen(false);
    setIsExpanded(true);
  };

  return (
    <aside
      aria-label="FairSales"
      className={`select-none font-sans ${
        isExpanded
          ? "max-sm:fixed max-sm:inset-0 max-sm:z-[400] max-sm:flex max-sm:h-auto max-sm:w-full max-sm:flex-col max-sm:overflow-hidden max-sm:bg-white dark:max-sm:bg-[#0d0e15] max-sm:overscroll-contain sm:fixed sm:bottom-6 sm:right-6 sm:z-50 sm:flex sm:flex-col sm:items-end"
          : "fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end"
      } copilot-public-dock ${isExpanded ? "is-expanded" : ""} ${publicDock && dockHidden ? "is-hidden pointer-events-none" : "pointer-events-auto"}`}
    >
      {isExpanded && (
        <CopilotSheet
          currentWidthClass={currentWidthClass}
          menuRef={menuRef}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onNewConversation={handleNewConversationClick}
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onDeleteThread={deleteThread}
          onClose={handleCloseChevron}
          messages={messages}
          loading={loading}
          messagesEndRef={messagesEndRef}
          publicGlass={publicDock}
        />
      )}

      <div
        className={
          isExpanded
            ? "copilot-composer-bar w-full max-sm:w-full max-sm:shrink-0 max-sm:px-3 max-sm:py-2.5 max-sm:pb-[calc(env(safe-area-inset-bottom,0px)+12px)] max-sm:bg-white dark:max-sm:bg-[#0d0e15] max-sm:border-t max-sm:border-slate-200/80 dark:max-sm:border-white/10"
            : ""
        }
      >
        <CopilotComposer
          publicDock={publicDock}
          isExpanded={isExpanded}
          hasActiveConversation={!isExpanded && hasActiveConversation}
          currentWidthClass={isExpanded ? currentWidthClass : currentWidthClass}
          input={input}
          isFocused={isFocused}
          inputRef={inputRef}
          animatedPlaceholder={animatedPlaceholder}
          onInput={setInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          onContinue={() => {
            setIsExpanded(true);
            if (onOpen) onOpen();
          }}
        />
      </div>
    </aside>
  );
});

CopilotDrawer.displayName = "CopilotDrawer";
