"use client";

import { Outlet } from "@/compat/router";
import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

export function PublicLayout({ children }: { children?: ReactNode }) {
  return (
    <AuthShell>
      {children ?? <Outlet />}
    </AuthShell>
  );
}
