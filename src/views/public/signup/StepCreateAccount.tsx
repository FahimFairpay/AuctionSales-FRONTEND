"use client";

import React, { useState, useEffect, type FormEvent } from "react";
import { Link } from "@/compat/router";
import { paths } from "@/routes/paths";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthStepper } from "@/components/auth/AuthStepper";
import { checkPassword } from "@/auth/passwordPolicy";

export interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneDigits: string; // 10 clean digits
  password: string;
}

interface StepCreateAccountProps {
  initialData: AccountFormData;
  pending: boolean;
  error: string;
  onSubmit: (data: AccountFormData) => void;
}

function formatUsPhoneDisplay(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export function StepCreateAccount({
  initialData,
  pending,
  error,
  onSubmit,
}: StepCreateAccountProps) {
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName);
  const [email, setEmail] = useState(initialData.email);
  const [phoneDigits, setPhoneDigits] = useState(initialData.phoneDigits);
  const [password, setPassword] = useState(initialData.password);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState("");

  const passCheck = checkPassword(password);
  const isPasswordValid =
    passCheck.minLength &&
    passCheck.upper &&
    passCheck.lower &&
    passCheck.number &&
    passCheck.symbol;

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneDigits(raw);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setClientError("");

    if (!firstName.trim()) {
      setClientError("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setClientError("Last name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setClientError("A valid email address is required.");
      return;
    }
    if (phoneDigits.length !== 10) {
      setClientError("Please enter a full 10-digit US mobile number.");
      return;
    }
    if (!isPasswordValid) {
      setClientError("Please satisfy all password complexity rules.");
      return;
    }
    if (password !== confirmPassword) {
      setClientError("Passwords do not match.");
      return;
    }

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phoneDigits,
      password,
    });
  }

  const activeError = clientError || error;

  return (
    <AuthCard
      title="Create Account"
      subtitle="Join the marketplace and find your perfect car."
      maxWidth="480px"
    >
      {/* 3-Step Progress Indicator */}
      <AuthStepper currentStep={1} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        {/* Row 1: First & Last Name (2-Column Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          <AuthInput
            label="First Name *"
            id="firstName"
            placeholder="First"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            leadIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <AuthInput
            label="Last Name *"
            id="lastName"
            placeholder="Last"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            leadIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
        </div>

        {/* Row 2: Email Address */}
        <AuthInput
          label="Email Address *"
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leadIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          }
        />

        {/* Row 3: Mobile Phone (+1 US Prefix Badge) */}
        <AuthInput
          label="Mobile Number *"
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(555) 000-0000"
          value={formatUsPhoneDisplay(phoneDigits)}
          onChange={handlePhoneChange}
          prefixBadge="+1"
          required
        />

        {/* Row 4: Password & Confirm Password (2-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <AuthInput
            label="Password *"
            id="password"
            type="password"
            isPassword
            autoComplete="new-password"
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
            label="Confirm Password *"
            id="confirmPassword"
            type="password"
            isPassword
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            leadIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />
        </div>

        {/* Live Password Hints: Compact horizontal badge indicators */}
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
            {confirmPassword.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full border ${passwordsMatch ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-rose-500/15 border-rose-500/30 text-rose-400"}`}>
                {passwordsMatch ? "✓ Match" : "Mismatched"}
              </span>
            )}
          </div>
        )}

        {/* Error Banner */}
        {activeError && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs text-rose-400 text-center font-medium">
            {activeError}
          </div>
        )}

        {/* Radiant Claude Terracotta CTA */}
        <button
          type="submit"
          className="btn-auth-primary mt-1"
          disabled={pending}
        >
          {pending ? (
            <span>Creating account…</span>
          ) : (
            <>
              <span>Continue</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Bottom Link: Already have an account? Log In - Clean & Neat Style */}
        <p className="text-center text-xs text-white/55 mt-2">
          Already have an account?{" "}
          <Link
            to={paths.signIn}
            className="text-white font-semibold hover:underline underline-offset-4 transition-colors ml-1"
          >
            Log In
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
