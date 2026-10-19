"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackVisitorTelemetry } from "@/lib/visitorTracking";

function VisitorTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams?.toString();
    const fullPath = query ? `${pathname}?${query}` : (pathname || "/");
    trackVisitorTelemetry(fullPath);
  }, [pathname, searchParams]);

  return null;
}

export function VisitorTracker() {
  return (
    <Suspense fallback={null}>
      <VisitorTrackerInner />
    </Suspense>
  );
}

export default VisitorTracker;
