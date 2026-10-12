"use client";

import React, { useState, forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leadIcon?: ReactNode;
  trailIcon?: ReactNode;
  isPassword?: boolean;
  prefixBadge?: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  {
    label,
    leadIcon,
    trailIcon,
    isPassword,
    prefixBadge,
    error,
    type = "text",
    className = "",
    id,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || props.name;

  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="auth-field-group">
      {label && (
        <label htmlFor={inputId} className="auth-field-label">
          {label}
        </label>
      )}

      <div className="auth-input-pill-wrap">
        {prefixBadge && <span className="auth-phone-prefix-pill">{prefixBadge}</span>}

        {leadIcon && !prefixBadge && (
          <span className="auth-input-icon-lead" aria-hidden="true">
            {leadIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={`auth-input-pill ${isPassword || trailIcon ? "has-trail" : ""} ${className}`}
          suppressHydrationWarning
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            className="auth-input-action-trail"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        ) : (
          trailIcon && <span className="auth-input-action-trail">{trailIcon}</span>
        )}
      </div>

      {error && <span className="text-[11px] text-rose-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
});
