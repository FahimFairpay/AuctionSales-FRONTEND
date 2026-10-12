"use client";

import React, { useRef, useEffect, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Array of 6 digits from value string
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function handleDigitChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const rawVal = e.target.value.replace(/\D/g, "");
    if (!rawVal) {
      // Cleared
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    const lastChar = rawVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const combined = newDigits.join("");
    onChange(combined);

    // Auto-advance to next input
    if (index < 5 && lastChar) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    onChange(pasted);
    const nextFocusIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextFocusIndex]?.focus();
  }

  return (
    <div className="auth-otp-row" role="group" aria-label="Verification Code Input">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleDigitChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="auth-otp-box"
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}
