"use client";

import { Suspense } from "react";
import { SignInPage } from "@/views/public/SignInPage";
import { RedirectIfSignedIn } from "@/routes/guards";
export default function Page() {
  return (
    <Suspense fallback={null}>
      <RedirectIfSignedIn>
        <SignInPage />
      </RedirectIfSignedIn>
    </Suspense>
  );
}
