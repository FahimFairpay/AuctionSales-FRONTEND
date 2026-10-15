"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { paths } from "../../routes/paths";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockNumber?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  stockNumber,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const signInHref = `${paths.signIn}?next=${encodeURIComponent(currentPath)}`;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[340px] sm:max-w-sm rounded-2xl p-6 bg-white dark:bg-[#1a1b23] border border-black/10 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-150 text-left select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Dismiss Cross Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog and continue chatting"
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>

        {/* Animated Heart Icon Badge */}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#d97757]/20 to-[#e88a59]/30 text-[#d97757] mb-3.5 shadow-xs border border-[#d97757]/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Title & Description */}
        <h3 id="auth-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
          Save to Interested
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          To mark vehicles as interested, create an account or sign in. Track live wholesale auction bids, watchlists, and price alerts.
        </p>

        {stockNumber && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            <span>Lot #{stockNumber}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={signInHref}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d97757] to-[#ce6e42] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 transition"
          >
            <span>Sign In / Sign Up</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6 2h8a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5v-2a.5.5 0 0 1 1 0v2z" />
              <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 text-center text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
          >
            Continue with open chat
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
