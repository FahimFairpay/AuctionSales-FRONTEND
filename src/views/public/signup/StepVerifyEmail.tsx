"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthStepper } from "@/components/auth/AuthStepper";
import { OtpInput } from "@/components/auth/OtpInput";

interface StepVerifyEmailProps {
  email: string;
  pending: boolean;
  error: string;
  onVerify: (otp: string) => void;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export function StepVerifyEmail({
  email,
  pending,
  error,
  onVerify,
  onResend,
  onBack,
}: StepVerifyEmailProps) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // 60-second countdown timer for Resend OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendSuccess(false);
    try {
      await onResend();
      setResendSuccess(true);
      setCooldown(60);
    } catch {
      // Handled by parent error prop
    } finally {
      setResending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (otp.trim().length !== 6) return;
    onVerify(otp.trim());
  }

  const formattedCooldown = `00:${cooldown < 10 ? `0${cooldown}` : cooldown}`;

  return (
    <AuthCard maxWidth="460px">
      {/* 3-Step Progress Indicator */}
      <AuthStepper currentStep={2} />

      {/* Hero Circular Glowing Mail Badge */}
      <div className="auth-hero-mail-badge" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>

      <div className="text-center mb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--auth-text-heading)]">
          Verify Your Email
        </h1>
        <p className="mt-1 text-xs text-[var(--auth-text-body)]">
          We've sent a 6-digit verification code to
        </p>
        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-[var(--auth-input-bg)] border border-[var(--auth-input-border)] text-xs text-[var(--auth-text-heading)]">
          <span className="font-semibold">{email || "your-email@example.com"}</span>
          <button
            type="button"
            onClick={onBack}
            className="auth-inline-edit-icon-btn"
            title="Edit email address"
            aria-label="Edit email address"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Discrete 6-Box OTP Inputs */}
        <OtpInput value={otp} onChange={setOtp} disabled={pending} />

        {/* Resend OTP Row */}
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--auth-text-muted)]">
          <span>Didn't receive the code?</span>
          {cooldown > 0 ? (
            <span className="font-medium text-stone-300">
              Resend OTP ({formattedCooldown})
            </span>
          ) : (
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={resending}
              className="font-medium text-white hover:underline underline-offset-2 transition-colors"
            >
              {resending ? "Sending…" : "Resend Code"}
            </button>
          )}
        </div>

        {resendSuccess && (
          <p className="text-xs text-emerald-400 text-center font-medium">
            A new 6-digit code was sent to your email.
          </p>
        )}

        {/* Error Banner */}
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        {/* Radiant Claude Terracotta CTA */}
        <button
          type="submit"
          disabled={otp.length !== 6 || pending}
          className="btn-auth-primary mt-1"
        >
          {pending ? (
            <span>Verifying…</span>
          ) : (
            <>
              <span>Verify Email</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Back Link - Clean & Neat Style */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={onBack}
            className="auth-clean-back-link"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Back to Account Details</span>
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
