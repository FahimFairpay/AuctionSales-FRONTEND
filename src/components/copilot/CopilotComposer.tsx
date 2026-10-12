"use client";

import type { FormEvent, KeyboardEvent, RefObject } from "react";

interface CopilotComposerProps {
  publicDock: boolean;
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
  publicDock,
  hasActiveConversation,
  currentWidthClass,
  input,
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

  if (hasActiveConversation) {
    return (
      <div
        onClick={onContinue}
        className="copilot-public-pill group flex w-[210px] sm:w-[260px] cursor-pointer select-none items-center justify-between gap-2.5 rounded-full px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-300"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-gradient-to-tr from-accent via-[#ce6e42] to-[#e88a59] text-[10px] font-bold text-white shadow-xs">
            FS
          </span>
          <span className="text-xs font-semibold tracking-tight transition group-hover:text-accent">
            Continue conversation
          </span>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ color: "var(--muted)" }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M4.00009 10.8501C4.22009 10.8501 4.44009 10.7701 4.60009 10.6001L8.00009 7.2001L11.4001 10.6001C11.7301 10.9301 12.2701 10.9301 12.6001 10.6001C12.9301 10.2701 12.9301 9.7301 12.6001 9.4001L8.00009 4.8001L3.40009 9.4001C3.07009 9.7301 3.07009 10.2701 3.40009 10.6001C3.57009 10.7701 3.78009 10.8501 4.00009 10.8501Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        `${currentWidthClass} select-text transition-[width] duration-300 ease-out`
      }
    >
      <div
        className="copilot-public-pill relative flex items-center overflow-hidden rounded-full py-1 pl-4 pr-1.5 transition-all duration-300"
      >
        <div className="relative flex flex-1 items-center">
          {publicDock ? (
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => onInput(event.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={animatedPlaceholder}
              aria-label="Ask FairScout AI"
              className="copilot-public-input"
            />
          ) : (
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => onInput(event.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={animatedPlaceholder}
              style={{ outline: "none", boxShadow: "none", border: "none" }}
              className="w-full resize-none border-0 bg-transparent py-1.5 text-xs leading-relaxed font-normal text-[#141413] shadow-none outline-none ring-0 placeholder:text-[#64748b]/80 focus:border-0 focus:outline-none focus:ring-0 dark:text-[#f7f6f2] dark:placeholder:text-[#94a3b8]/60"
            />
          )}
        </div>

        <div className="ml-1.5 shrink-0">
          {publicDock ? (
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
          ) : (
            <button
              type="submit"
              className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-all active:scale-95 ${
                hasText
                  ? "scale-105 border-white/60 bg-accent/90 text-white shadow-[0_4px_12px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-white/25 dark:bg-accent/85 dark:shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.4)]"
                  : "border-black/[0.06] bg-black/[0.04] text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] hover:bg-black/[0.08] hover:text-ink dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] dark:hover:bg-white/[0.14]"
              }`}
              title="Send message"
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
          )}
        </div>
      </div>
    </form>
  );
}
