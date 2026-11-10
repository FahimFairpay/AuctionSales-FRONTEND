"use client";

import { Suspense } from "react";
import { FairentalDetailPage } from "@/views/fairental/FairentalDetailPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FairentalDetailPage admin />
    </Suspense>
  );
}
