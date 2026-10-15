"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/theme/ThemeProvider";
import { paths } from "@/routes/paths";
import "./public-header.css";
import { BrandWordmark } from "./BrandWordmark";

interface PublicHeaderProps {
  mode?: "landing" | "inventory";
}

export function PublicHeader({ mode = "landing" }: PublicHeaderProps) {
  const { appearance, setAppearance } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isDark = appearance === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  // At the top the bar blends into the page. Past 20px it becomes the glass island.
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fps-theme-selected", "true");
    }
    setAppearance(isDark ? "light" : "dark");
  };

  const isSolid = isScrolled;

  return (
    <header
      className={`site-header header-opt3-wrap ${mode === "inventory" ? "mode-inventory" : ""} ${isSolid ? "scrolled" : "at-top"}`}
      id="morphingHeader"
    >
      <div className="opt3-bar-inner">
        {/* Brand Logo Pod */}
        <Link
          href="/"
          className="brand-container"
          aria-label="FairSales Home"
        >
          <BrandWordmark />
        </Link>

        {/* Center Nav Links */}
        <nav className="opt3-nav-group" aria-label="Main Navigation">
          {mode === "inventory" ? (
            <>
              <Link href="/" className="opt3-nav-link font-medium">
                Home
              </Link>
              <Link href="/#journey" className="opt3-nav-link">
                How it works
              </Link>
              <Link href="/#trust" className="opt3-nav-link">
                About us
              </Link>
            </>
          ) : (
            <>
              <Link href={paths.publicInventory} className="opt3-nav-link">
                Browse Cars
              </Link>
              <a href="#journey" className="opt3-nav-link">
                How it works
              </a>
              <a href="#trust" className="opt3-nav-link">
                About us
              </a>
            </>
          )}
        </nav>

        {/* Right Action Controls: SVG Theme Toggle LEFT TO Sign In */}
        <div className="opt3-right-actions">
          {/* Theme Toggle SVG button */}
          <button
            type="button"
            className="theme-toggle-btn"
            aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            {mounted && isDark ? (
              // Sun icon for dark mode
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              // Moon icon for light mode
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Unified Sign In entry point */}
          <Link href={paths.signIn} className="opt3-signin-btn">
            Login / Register
          </Link>
        </div>
      </div>
    </header>
  );
}
