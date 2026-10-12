"use client";

import React from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { PrivacyPolicyContent } from "@/views/public/signup/PrivacyPolicyContent";

export default function PrivacyPage() {
  return (
    <AuthCard
      title="Privacy Policy"
      subtitle="How FairSales collects, protects, and handles commercial account data."
      maxWidth="680px"
    >
      <div className="auth-terms-inset-box !max-h-[calc(100dvh-220px)] my-2">
        <PrivacyPolicyContent />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
        <Link
          href="/terms"
          className="auth-subtle-link"
        >
          View Terms of Service →
        </Link>
        <Link
          href="/sign-up"
          className="auth-clean-back-link"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Back to Registration</span>
        </Link>
      </div>
    </AuthCard>
  );
}
