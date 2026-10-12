"use client";

import React, { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "@/compat/router";
import { useAuth } from "@/auth/AuthProvider";
import { passwordMeetsPolicy, checkPassword } from "@/auth/passwordPolicy";
import { completeNewPassword, hasPendingNewPassword } from "@/auth/session";
import { paths } from "@/routes/paths";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";

export function NewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  if (!hasPendingNewPassword()) {
    return <Navigate to={paths.signIn} replace />;
  }

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
      setError("Password does not meet the policy.");
      return;
    }
    setPending(true);
    try {
      await completeNewPassword(password);
      await auth.refresh();
      navigate(paths.home, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="Choose a New Password"
      subtitle="Your account requires setting a permanent secure password."
      maxWidth="460px"
    >
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-2.5">
        <AuthInput
          label="New Password"
          id="password"
          type="password"
          isPassword
          autoComplete="new-password"
          placeholder="Min 10 chars"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
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
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          required
          leadIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
        />

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
              <span>Set Password & Sign In</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>
    </AuthCard>
  );
}
