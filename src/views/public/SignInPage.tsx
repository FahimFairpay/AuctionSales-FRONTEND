"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "@/compat/router";
import { useAuth } from "@/auth/AuthProvider";
import { mapSignInError, signIn } from "@/auth/session";
import { paths } from "@/routes/paths";
import { BrandWordmark } from "@/components/layout/BrandWordmark";
import { AuthInput } from "@/components/auth/AuthInput";

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = useAuth();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      if (result.kind === "newPasswordRequired") {
        navigate(paths.newPassword);
        return;
      }
      await auth.refresh();
      const next = params.get("next") || paths.home;
      navigate(next.startsWith("/") ? next : paths.home, { replace: true });
    } catch (err) {
      setError(mapSignInError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="auth-signin-split-container">
      {/* Left Column: Broad Statement with Landing Page Scale & Typography (Desktop only) */}
      <div className="auth-signin-hero-statement">
        <Link
          to="/"
          aria-label="FairSales Home"
          className="auth-signin-brand-badge mb-2 inline-flex items-center"
        >
          <BrandWordmark size="display" />
        </Link>

        <div className="auth-signin-eyebrow">
          <span className="eyebrow-dot" />
          <span>Intelligent Auto Sales</span>
        </div>

        <h1>
          <em>Welcome Back</em>
        </h1>

        <p>
          Unlock dealer-tier wholesale pricing and save up to 25% on your next vehicle purchase.
        </p>
      </div>

      {/* Right Column: Floating Liquid Glass Card */}
      <div className="auth-glass-card mx-auto">
        {/* Segmented Mode Switcher: Sign In / Sign Up */}
        <div className="auth-segmented-switch">
          <button type="button" className="auth-segmented-tab active" aria-selected="true">
            Sign In
          </button>
          <Link to={paths.signUp} className="auth-segmented-tab" aria-selected="false">
            Sign Up
          </Link>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-3.5">
          {/* Email Field with Envelope SVG */}
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

          {/* Password Field with Lock SVG and Eye Toggle */}
          <AuthInput
            label="Password"
            id="password"
            type="password"
            isPassword
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leadIcon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />

          {/* Forgot Password Link */}
          <div className="flex items-center justify-end text-xs pt-0.5">
            <Link
              to={paths.forgotPassword}
              className="auth-subtle-link"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-400 text-center font-medium">
              {error}
            </div>
          )}

          {/* Radiant Liquid Glass Primary CTA */}
          <button type="submit" className="btn-auth-primary mt-1" disabled={pending}>
            {pending ? (
              <span>Signing in…</span>
            ) : (
              <>
                <span>Sign In</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>

          {/* Footer Card Text - Clean & Neat Style */}
          <p className="text-center text-xs text-white/55 mt-2">
            Don't have an account?{" "}
            <Link
              to={paths.signUp}
              className="text-white font-semibold hover:underline underline-offset-4 transition-colors ml-1"
            >
              Create an Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
