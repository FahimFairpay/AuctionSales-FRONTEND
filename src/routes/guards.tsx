"use client";

import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "@/compat/router";
import { useAuth } from "../auth/AuthProvider";
import { FairOrb } from "../components/orb/FairOrb";
import { signInWithNext } from "./paths";

export function RequireAuth({ children }: { children?: ReactNode } = {}) {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.ready) {
    return <FairOrb state="connecting" label="Checking session" />;
  }
  if (!auth.signedIn) {
    return <Navigate to={signInWithNext(`${location.pathname}${location.search}`)} replace />;
  }
  return children ? <>{children}</> : <Outlet />;
}

export function RequireAdmin({ children }: { children?: ReactNode } = {}) {
  const auth = useAuth();
  if (!auth.ready) {
    return <FairOrb state="connecting" label="Checking session" />;
  }
  if (!auth.isAdmin) {
    return <Navigate to="/app" replace />;
  }
  return children ? <>{children}</> : <Outlet />;
}

export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (auth.ready && auth.signedIn) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}
