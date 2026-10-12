import { Suspense } from "react";
import { PublicLayout } from "@/layouts/PublicLayout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </PublicLayout>
  );
}
