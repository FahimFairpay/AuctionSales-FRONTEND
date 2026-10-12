"use client";

import React, { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandWordmark } from "@/components/layout/BrandWordmark";
import "./auth-glass.css";

interface AuthShellProps {
  children: ReactNode;
}

/**
 * AuthShell: Rigidly locks all authentication views to 100dvh with zero outer scrollbars.
 * Provides the full-bleed automotive hero background, theme-adaptive scrim, and compact header.
 */
export function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname();
  const isSignInPage = pathname === "/sign-in" || pathname === "/login";

  // Enforce dark obsidian liquid glass theme across auth suite
  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
  }, []);

  return (
    <div className="auth-shell-viewport-root">
      {/* Layer 1: Full-Bleed Automotive Hero Background & Scrim */}
      <div className="auth-shell-bg-container" aria-hidden="true">
        <img
          src="/assets/secondlook_hero.jpg"
          alt=""
          className="auth-shell-bg-image"
          loading="eager"
        />
        <div className="auth-shell-scrim" />
      </div>

      {/* Layer 2: Compact Top Glass Header (52px) */}
      <header className="auth-shell-header">
        {!isSignInPage ? (
          <Link href="/" aria-label="FairSales Home" className="auth-shell-brand-link">
            <BrandWordmark size="header" />
          </Link>
        ) : (
          <div className="auth-shell-brand-spacer" />
        )}
        <div className="auth-shell-header-actions">
          <span className="auth-shell-tagline">Buy Smart. Drive Better.</span>
        </div>
      </header>

      {/* Layer 3: Main Flex Stage (Strictly fitted within 100dvh, zero outer scroll) */}
      <main className="auth-shell-main-stage">
        {children}
      </main>

      {/* Layer 4: Compact Glass Footer (32px) */}
      <footer className="auth-shell-footer">
        <span>© 2026 FairSales Inc. All rights reserved.</span>
        <span>·</span>
        <Link href="/terms">Terms</Link>
        <span>·</span>
        <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
