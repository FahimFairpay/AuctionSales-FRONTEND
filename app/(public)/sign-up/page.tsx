"use client";

import { Suspense } from "react";
import { SignUpPage } from "@/views/public/SignUpPage";
import { RedirectIfSignedIn } from "@/routes/guards";
import { FairOrb } from "@/components/orb/FairOrb";

export default function Page() {
  return (
    <Suspense fallback={<FairOrb state="working" label="Loading sign up..." />}>
      <SignUpPage />
    </Suspense>
  );
}
