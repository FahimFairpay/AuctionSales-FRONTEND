import { Suspense } from "react";
import { FairentalBrowse } from "@/views/fairental/FairentalBrowse";

export default function FairentalPage() {
  return (
    <Suspense fallback={null}>
      <FairentalBrowse />
    </Suspense>
  );
}
