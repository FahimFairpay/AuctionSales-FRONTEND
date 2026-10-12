"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "@/compat/router";
import { passwordMeetsPolicy, checkPassword } from "@/auth/passwordPolicy";
import { confirmForgotPassword } from "@/auth/session";
import { useToast } from "@/components/Toast";
import { paths } from "@/routes/paths";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";

export function ForgotConfirmPage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const passCheck = checkPassword(password);
  const passwordsMatch = confirm.length > 0 && password === confirm;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordMeetsPolicy(password)) {
      setError("Password does not meet the complexity requirements.");
      return;
    }
    setPending(true);
    try {
      await confirmForgotPassword(email.trim().toLowerCase(), code.trim(), password);
      pushToast("Password updated successfully. Please sign in.", "success");
      navigate(paths.signIn, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Set a New Password"
      subtitle="Enter the verification code and choose a new secure password."
      maxWidth="460px"
    >
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-2.5">
        {/* Account Email Display Badge (Non-editable, with Edit action) */}
        <div className="auth-field-group">
          <span className="auth-field-label">Email Address</span>
          <div className="flex items-center justify-between h-[42px] px-3.5 rounded-xl bg-[var(--auth-input-bg)] border border-[var(--auth-input-border)] text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--auth-text-muted)] shrink-0">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span className="font-semibold text-[var(--auth-input-text)] truncate">
                {email || "your-email@example.com"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate(paths.forgotPassword)}
              className="auth-inline-edit-icon-btn shrink-0 ml-2"
              title="Edit email address"
              aria-label="Edit email address"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          </div>
        </div>

        <AuthInput
          label="Verification Code (6-Digit)"
          id="code"
          type="text"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          leadIcon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <AuthInput
            label="New Password"
            id="password"
            type="password"
            isPassword
            placeholder="Min 10 chars"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leadIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />

          <AuthInput
            label="Confirm Password"
            id="confirm"
            type="password"
            isPassword
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            leadIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />
        </div>

        {/* Live Password Complexity Hints */}
        {password.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] py-0.5">
            <span className={`px-2 py-0.5 rounded-full border ${passCheck.minLength ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/50"}`}>
              {passCheck.minLength ? "✓" : "·"} 10+ chars
            </span>
            <span className={`px-2 py-0.5 rounded-full border ${passCheck.upper && passCheck.lower ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/50"}`}>
              {passCheck.upper && passCheck.lower ? "✓" : "·"} Upper & lower
            </span>
            <span className={`px-2 py-0.5 rounded-full border ${passCheck.number ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/50"}`}>
              {passCheck.number ? "✓" : "·"} Number
            </span>
            <span className={`px-2 py-0.5 rounded-full border ${passCheck.symbol ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/50"}`}>
              {passCheck.symbol ? "✓" : "·"} Symbol
            </span>
            {confirm.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full border ${passwordsMatch ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-rose-500/15 border-rose-500/30 text-rose-400"}`}>
                {passwordsMatch ? "✓ Match" : "Mismatched"}
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        <button type="submit" className="btn-auth-primary mt-1" disabled={pending}>
          {pending ? (
            <span>Updating password…</span>
          ) : (
            <>
              <span>Update Password</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>

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
