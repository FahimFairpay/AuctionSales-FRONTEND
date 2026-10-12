"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "@/compat/router";
import { forgotPassword } from "@/auth/session";
import { paths } from "@/routes/paths";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    await forgotPassword(email.trim().toLowerCase());
    setPending(false);
    setDone(true);
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your email address and we'll send a 6-digit recovery code."
      maxWidth="440px"
    >
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-3.5">
        <AuthInput
          label="Email Address"
          id="email"
          type="email"
          autoComplete="username"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leadIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          }
        />

        {done && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-400 text-center font-medium">
            If this email is registered, a recovery code has been sent.
          </div>
        )}

        <button type="submit" className="btn-auth-primary mt-1" disabled={pending}>
          {pending ? (
            <span>Sending code…</span>
          ) : (
            <>
              <span>Send Recovery Code</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {done && (
          <button
            type="button"
            onClick={() =>
              navigate(`${paths.forgotConfirm}?email=${encodeURIComponent(email.trim().toLowerCase())}`)
            }
            className="flex items-center justify-center h-[42px] rounded-full border border-[var(--auth-glass-card-border)] bg-[var(--auth-tab-track-bg)] hover:bg-white/10 text-xs font-semibold text-[var(--auth-text-heading)] transition-all"
          >
            Enter Verification Code →
          </button>
        )}

        <div className="flex justify-center mt-2">
          <Link to={paths.signIn} className="auth-clean-back-link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Back to Sign In</span>
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
