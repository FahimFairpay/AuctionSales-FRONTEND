import { Suspense } from "react";
import { FairentalDetailPage } from "@/views/fairental/FairentalDetailPage";

export default function SalesCarPage() {
  return (
    <Suspense fallback={null}>
      <FairentalDetailPage />
    </Suspense>
  );
}
