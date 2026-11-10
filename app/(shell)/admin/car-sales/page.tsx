"use client";

import { Suspense } from "react";
import { AdminFairentalPage } from "@/views/fairental/AdminFairentalPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminFairentalPage />
    </Suspense>
  );
}
