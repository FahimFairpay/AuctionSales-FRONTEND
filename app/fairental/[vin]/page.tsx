import { Suspense } from "react";
import { FairentalDetailPage } from "@/views/fairental/FairentalDetailPage";

export default function FairentalCarPage() {
  return (
    <Suspense fallback={null}>
      <FairentalDetailPage />
    </Suspense>
  );
}
