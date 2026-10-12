"use client";

import React from "react";

interface AuthStepperProps {
  currentStep: 1 | 2 | 3;
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#34d399"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="drop-shadow-[0_1px_3px_rgba(16,185,129,0.5)]"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function AuthStepper({ currentStep }: AuthStepperProps) {
  return (
    <div className="auth-stepper-wrap" aria-label={`Step ${currentStep} of 3`}>
      <div className="auth-stepper-track-line" />

      {/* Step 1 */}
      <div
        className={`auth-stepper-node ${
          currentStep === 1 ? "active" : currentStep > 1 ? "completed" : ""
        }`}
      >
        {currentStep > 1 ? <CheckIcon /> : "1"}
      </div>

      {/* Step 2 */}
      <div
        className={`auth-stepper-node ${
          currentStep === 2 ? "active" : currentStep > 2 ? "completed" : ""
        }`}
      >
        {currentStep > 2 ? <CheckIcon /> : "2"}
      </div>

      {/* Step 3 */}
      <div className={`auth-stepper-node ${currentStep === 3 ? "active" : ""}`}>
        3
      </div>
    </div>
  );
}
