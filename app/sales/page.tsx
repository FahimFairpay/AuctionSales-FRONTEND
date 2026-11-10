import { Suspense } from "react";
import { FairentalBrowse } from "@/views/fairental/FairentalBrowse";

export default function SalesPage() {
  return (
    <Suspense fallback={null}>
      <FairentalBrowse />
    </Suspense>
  );
}
