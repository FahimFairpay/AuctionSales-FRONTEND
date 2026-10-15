"use client";

import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { CircumferenceBeam } from "./CircumferenceBeam";

interface CopilotComposerProps {
  publicDock: boolean;
  isExpanded?: boolean;
  hasActiveConversation: boolean;
  currentWidthClass: string;
  input: string;
  isFocused: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  animatedPlaceholder: string;
  onInput: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: (event?: FormEvent) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onContinue: () => void;
}

export function CopilotComposer({
  isExpanded = false,
  hasActiveConversation,
  currentWidthClass,
  input,
  isFocused = false,
  inputRef,
  animatedPlaceholder,
  onInput,
  onFocus,
  onBlur,
  onSubmit,
  onKeyDown,
  onContinue,
}: CopilotComposerProps) {
  const hasText = input.trim().length > 0;

  // DOCKED ACTIVE CONVERSATION (Collapsed state: New design style + Terracotta FS avatar badge)
  if (hasActiveConversation) {
    return (
      <div className="beam-anchor has-pulse">
        <CircumferenceBeam active={true} />
        <div
          onClick={onContinue}
          className="copilot-public-pill relative z-10 group flex w-[220px] sm:w-[260px] cursor-pointer select-none items-center justify-between gap-2.5 rounded-full px-3.5 py-2 sm:px-4 sm:py-2.5 transition-all duration-300"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Terracotta Orange FS Avatar Badge matching reference image */}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/25 bg-gradient-to-tr from-[#c4673a] via-[#ce6e42] to-[#e88a59] text-[10px] font-bold text-white shadow-xs">
              FS
            </span>
            <span className="copilot-continue-text whitespace-nowrap">
              <span className="sm:hidden">Continue chat</span>
              <span className="hidden sm:inline">Continue conversation</span>
            </span>
          </div>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/70 transition-transform group-hover:-translate-y-0.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M4.00009 10.8501C4.22009 10.8501 4.44009 10.7701 4.60009 10.6001L8.00009 7.2001L11.4001 10.6001C11.7301 10.9301 12.2701 10.9301 12.6001 10.6001C12.9301 10.2701 12.9301 9.7301 12.6001 9.4001L8.00009 4.8001L3.40009 9.4001C3.07009 9.7301 3.07009 10.2701 3.40009 10.6001C3.57009 10.7701 3.78009 10.8501 4.00009 10.8501Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </div>
      </div>
    );
  }

  // STATE B: ANSWER AREA IS OPEN / EXPANDED
  // Seamlessly blends into the sheet palette, no conflicting floating glass or beam
  if (isExpanded) {
    return (
      <form
        onSubmit={onSubmit}
        className={`${currentWidthClass} select-text w-full transition-[width] duration-300 ease-out`}
      >
        <div className="copilot-sheet-composer-blended">
          <div className="relative flex flex-1 items-center min-w-0 overflow-hidden">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => onInput(event.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={input ? "" : isFocused ? "Ask FairSales" : animatedPlaceholder}
              aria-label="Ask FairSales"
              className="copilot-blended-input"
            />
          </div>

          <div className="ml-1.5 shrink-0">
            <button
              type="submit"
              className={`copilot-public-send ${hasText ? "has-text" : ""}`}
              aria-label="Send query to AI"
              tabIndex={hasText ? 0 : -1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M7.4 1.899a.85.85 0 0 1 1.201 0l4.5 4.5A.85.85 0 1 1 11.9 7.6L8.85 4.552V13.5a.85.85 0 0 1-1.7 0V4.552L4.101 7.601A.85.85 0 1 1 2.9 6.399z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </form>
    );
  }

  // STATE A: DOCKED IDLE / INPUT (New design style + Circumference comet beam + pulse)
  return (
    <form
      onSubmit={onSubmit}
      className={`${currentWidthClass} select-text transition-[width] duration-300 ease-out`}
    >
      <div className={`beam-anchor w-full ${!hasText ? "has-pulse" : ""}`}>
        <CircumferenceBeam active={true} />
        <div className="copilot-public-pill relative z-10 flex items-center overflow-hidden rounded-full py-1.5 pl-4 pr-1.5 transition-all duration-300 w-full">
          <div className="relative flex flex-1 items-center min-w-0 overflow-hidden">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => onInput(event.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={input ? "" : isFocused ? "Ask FairSales" : animatedPlaceholder}
              aria-label="Ask FairSales"
              className="copilot-public-input"
            />
          </div>

          <div className="ml-1.5 shrink-0">
            <button
              type="submit"
              className={`copilot-public-send ${hasText ? "has-text" : ""}`}
              aria-label="Send query to AI"
              tabIndex={hasText ? 0 : -1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M7.4 1.899a.85.85 0 0 1 1.201 0l4.5 4.5A.85.85 0 1 1 11.9 7.6L8.85 4.552V13.5a.85.85 0 0 1-1.7 0V4.552L4.101 7.601A.85.85 0 1 1 2.9 6.399z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
