"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "@/compat/router";
import { useAuth } from "@/auth/AuthProvider";
import {
  signUp,
  confirmSignUp,
  resendConfirmationCode,
  signIn,
  mapSignUpError,
} from "@/auth/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, patchMe } from "@/api/users";
import { paths } from "@/routes/paths";
import {
  StepCreateAccount,
  type AccountFormData,
} from "./signup/StepCreateAccount";
import { StepVerifyEmail } from "./signup/StepVerifyEmail";
import { StepTermsModal } from "./signup/StepTermsModal";

type SignUpStep = "CREATE_ACCOUNT" | "VERIFY_EMAIL" | "TERMS_MODAL";

export function SignUpPage() {
  const [step, setStep] = useState<SignUpStep>("CREATE_ACCOUNT");
  const [formData, setFormData] = useState<AccountFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneDigits: "",
    password: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: getMe, enabled: auth.signedIn });

  // If already signed in, check if terms were accepted
  useEffect(() => {
    if (!auth.ready || !auth.signedIn) return;
    if (me.isLoading) return;

    if (me.data && me.data.termsAccepted === false) {
      // User is signed in but hasn't accepted terms yet -> ensure they are on TERMS_MODAL
      setStep("TERMS_MODAL");
    } else if (me.data?.termsAccepted && step === "CREATE_ACCOUNT" && !pending) {
      // User is already signed in and has accepted terms -> redirect to inventory
      navigate(paths.inventory, { replace: true });
    }
  }, [auth.ready, auth.signedIn, me.data?.termsAccepted, me.isLoading, step, pending, navigate]);

  // Support Dev URL Step Overrides (?step=1 | 2 | 3) for quick inspection
  useEffect(() => {
    const stepParam = params.get("step");
    if (stepParam === "2") {
      setStep("VERIFY_EMAIL");
      setFormData((prev) => (prev.email ? prev : { ...prev, email: "john.doe@example.com" }));
    } else if (stepParam === "3") {
      setStep("TERMS_MODAL");
    } else if (stepParam === "1") {
      setStep("CREATE_ACCOUNT");
    }
  }, [params]);

  // Step 1: Create Account
  async function handleAccountSubmit(data: AccountFormData) {
    setError("");
    setPending(true);
    setFormData(data);

    try {
      const e164Phone = `+1${data.phoneDigits}`;
      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: e164Phone,
      });
      setStep("VERIFY_EMAIL");
    } catch (err) {
      setError(mapSignUpError(err));
    } finally {
      setPending(false);
    }
  }

  // Step 2: Verify Email OTP & Silent Auto-Login
  async function handleVerifyEmail(otp: string) {
    setError("");
    setPending(true);

    try {
      // 1. Confirm Registration in Cognito
      await confirmSignUp(formData.email, otp);

      // 2. Silent Auto-Login using transient memory password
      await signIn(formData.email, formData.password);

      // 3. Wipe password from state immediately
      setFormData((prev) => ({ ...prev, password: "" }));

      // 4. Refresh auth session tokens
      await auth.refresh();

      // 5. Open Step 3 Terms Modal
      setStep("TERMS_MODAL");
    } catch (err) {
      setError(mapSignUpError(err));
    } finally {
      setPending(false);
    }
  }

  // Step 2: Resend OTP Code
  async function handleResendOtp() {
    setError("");
    try {
      await resendConfirmationCode(formData.email);
    } catch (err) {
      setError(mapSignUpError(err));
      throw err;
    }
  }

  // Step 3: Terms & Conditions Accepted -> Proceed to Marketplace
  async function handleTermsAccept(consent?: { notifyConsent: boolean }) {
    setError("");
    setPending(true);

    try {
      const e164Phone = formData.phoneDigits ? `+1${formData.phoneDigits}` : undefined;
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      await patchMe({
        ...(fullName ? { name: fullName } : {}),
        ...(e164Phone ? { phoneNumber: e164Phone } : {}),
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: "2026.1",
        privacyAccepted: true,
        notifyConsent: consent?.notifyConsent ?? true,
        notifyConsentAt: new Date().toISOString(),
      });

      await auth.refresh();
      await queryClient.invalidateQueries({ queryKey: ["me"] });

      // Seamless redirect to authenticated wholesale inventory
      navigate(paths.inventory, { replace: true });
    } catch (err) {
      setError(mapSignUpError(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full flex items-center justify-center">
      {step === "CREATE_ACCOUNT" && (
        <StepCreateAccount
          initialData={formData}
          pending={pending}
          error={error}
          onSubmit={(data) => void handleAccountSubmit(data)}
        />
      )}

      {step === "VERIFY_EMAIL" && (
        <StepVerifyEmail
          email={formData.email}
          pending={pending}
          error={error}
          onVerify={(otp) => void handleVerifyEmail(otp)}
          onResend={handleResendOtp}
          onBack={() => {
            setError("");
            setStep("CREATE_ACCOUNT");
          }}
        />
      )}

      {step === "TERMS_MODAL" && (
        <StepTermsModal
          pending={pending}
          error={error}
          onAccept={(consent) => void handleTermsAccept(consent)}
          onClose={() => setStep("CREATE_ACCOUNT")}
        />
      )}
    </div>
  );
}
