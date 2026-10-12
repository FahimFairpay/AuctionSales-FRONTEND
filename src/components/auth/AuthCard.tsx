"use client";

import React, { type ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  maxWidth?: string;
}

export function AuthCard({
  children,
  title,
  subtitle,
  className = "",
  maxWidth = "440px",
}: AuthCardProps) {
  return (
    <div
      className={`auth-glass-card ${className}`}
      style={{ maxWidth }}
    >
      {(title || subtitle) && (
        <div className="mb-4 text-center sm:text-left">
          {title && (
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--auth-text-heading)]">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1 text-xs sm:text-[13px] text-[var(--auth-text-body)] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
