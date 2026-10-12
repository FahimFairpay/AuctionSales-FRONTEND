"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthStepper } from "@/components/auth/AuthStepper";
import { TermsOfServiceContent } from "./TermsOfServiceContent";

interface StepTermsModalProps {
  pending: boolean;
  error: string;
  onAccept: (consent: { notifyConsent: boolean }) => void;
  onClose?: () => void;
}

export function StepTermsModal({
  pending,
  error,
  onAccept,
  onClose,
}: StepTermsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [notifyConsent, setNotifyConsent] = useState(true);

  return (
    <AuthCard maxWidth="520px">
      {/* 3-Step Progress Indicator */}
      <div className="relative">
        <AuthStepper currentStep={3} />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-xs text-[var(--auth-text-muted)] hover:text-[var(--auth-text-heading)] bg-[var(--auth-tab-track-bg)] border border-[var(--auth-glass-card-border)] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <div className="text-center sm:text-left mb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--auth-text-heading)]">
          Terms & Conditions
        </h1>
        <p className="mt-1 text-xs text-[var(--auth-text-body)]">
          Please review and accept our buyer agreement to complete registration.
        </p>
      </div>

      {/* Quick External Document Links */}
      <div className="flex items-center gap-2 my-2">
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="auth-doc-link-pill"
        >
          <span>Terms of Service</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </Link>
        <Link
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="auth-doc-link-pill"
        >
          <span>Privacy Policy</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </Link>
      </div>

      {/* Inset Scrollable Container: Terms of Service Summary */}
      <div className="auth-terms-inset-box">
        <TermsOfServiceContent />
      </div>

      {/* Checkbox 1: Terms & Conditions (Mandatory) */}
      <label className="auth-checkbox-row !my-1">
        <input
          type="checkbox"
          className="sr-only"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span className="auth-checkbox-custom">
          {accepted && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span className="text-xs leading-normal">
          I accept the <strong className="text-white">Terms & Conditions</strong> and <strong className="text-white">Privacy Policy</strong> for wholesale salvage access.
        </span>
      </label>

      {/* Checkbox 2: Email & SMS Notifications Consent */}
      <label className="auth-checkbox-row !my-1">
        <input
          type="checkbox"
          className="sr-only"
          checked={notifyConsent}
          onChange={(e) => setNotifyConsent(e.target.checked)}
        />
        <span className="auth-checkbox-custom">
          {notifyConsent && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <span className="text-xs leading-normal text-white/80">
          I consent to receive live auction alerts, bidding updates, and notices via <strong className="text-white">Email</strong> and <strong className="text-white">SMS</strong>.
        </span>
      </label>

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs text-rose-400 text-center font-medium my-1">
          {error}
        </div>
      )}

      {/* Radiant Claude Terracotta CTA */}
      <button
        type="button"
        disabled={!accepted || pending}
        onClick={() => onAccept({ notifyConsent })}
        className="btn-auth-primary mt-2"
      >
        {pending ? (
          <span>Finalizing registration…</span>
        ) : (
          <>
            <span>Continue to Marketplace</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </AuthCard>
  );
}
