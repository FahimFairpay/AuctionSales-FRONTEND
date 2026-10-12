"use client";

import { Link, NavLink, Outlet, useLocation, useNavigate } from "@/compat/router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { getMe } from "../api/users";
import { useAuth } from "../auth/AuthProvider";
import { ThemeCycleButton } from "../theme/ThemeCycleButton";
import { paths } from "../routes/paths";
import { Banners } from "./Banners";
import { NavGlyph } from "./NavGlyph";
import { CopilotDrawer } from "../components/copilot/CopilotDrawer";
import { BrandWordmark } from "../components/layout/BrandWordmark";

const NAV_KEY = "fps-nav-collapsed";

const appNav = [
  { to: paths.home, label: "Home", icon: "home", end: true },
  { to: paths.inventory, label: "Inventory", icon: "inventory" },
  { to: paths.presets, label: "Presets", icon: "watchlists" },
  { to: paths.history, label: "History", icon: "logs" },
  { to: paths.account, label: "Account", icon: "account" },
];

const adminNav = [
  { to: paths.adminUsers, label: "Users", icon: "users" },
  { to: paths.adminPresets, label: "Presets", icon: "all" },
  { to: paths.adminFailures, label: "Failures", icon: "fail" },
  { to: paths.adminCrawler, label: "Schedules", icon: "scrape" },
];

function navClass(active: boolean, collapsed: boolean): string {
  return `flex items-center gap-3 rounded-[10px] text-[13px] ${
    collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
  } ${active ? "bg-surface-muted text-ink" : "text-muted hover:bg-surface-muted hover:text-ink"}`;
}

export function AppShell({ children }: { children?: ReactNode } = {}) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const me = useQuery({ queryKey: ["me"], queryFn: getMe, enabled: auth.signedIn });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Require terms & conditions consent before accessing authenticated app shell
  useEffect(() => {
    if (auth.ready && auth.signedIn && me.data && me.data.termsAccepted === false) {
      navigate("/sign-up?step=3", { replace: true });
    }
  }, [auth.ready, auth.signedIn, me.data?.termsAccepted, navigate]);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(NAV_KEY) === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NAV_KEY) === "true";
      if (stored !== collapsed) {
        setCollapsed(stored);
      }
    } catch {}
  }, [collapsed]);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(NAV_KEY, String(next));
      } catch {}
      return next;
    });
  }

  const name = me.data?.name || me.data?.email?.split("@")[0] || "Signed in";
  const email = me.data?.email || "";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div
      className={`flex h-dvh flex-col overflow-hidden bg-canvas transition-[grid-template-columns] duration-150 ease-out lg:grid ${
        collapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[248px_minmax(0,1fr)]"
      }`}
    >
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex h-dvh w-[248px] flex-col overflow-hidden border-r border-hairline bg-surface px-3 py-4 transition-[width,transform] duration-150 ease-out lg:static ${
          collapsed ? "lg:w-[72px]" : "lg:w-[248px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`flex shrink-0 items-center ${collapsed ? "justify-center px-0" : "px-2"}`}>
          <Link href="/" aria-label="FairSales home" className="text-inherit no-underline">
            {collapsed ? (
              <span className="brand-wordmark brand-wordmark-header">
                <span className="brand-arrow" aria-hidden="true">↗︎</span>
              </span>
            ) : (
              <BrandWordmark />
            )}
          </Link>
        </div>
        <nav className="mt-7 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain" aria-label="Primary">
          {appNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) => navClass(isActive, collapsed)}
              onClick={() => setMobileOpen(false)}
            >
              <NavGlyph name={item.icon} />
              {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
            </NavLink>
          ))}
          {auth.isAdmin ? (
            <>
              {collapsed ? (
                <>
                  <div className="mx-auto my-3 h-px w-6 bg-hairline" />
                  <p className="sr-only">Admin</p>
                </>
              ) : (
                <p className="px-3 pb-1 pt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                  Admin
                </p>
              )}
              {adminNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={({ isActive }) => navClass(isActive, collapsed)}
                  onClick={() => setMobileOpen(false)}
                >
                  <NavGlyph name={item.icon} />
                  {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
                </NavLink>
              ))}
            </>
          ) : null}
        </nav>
        <div className="mt-auto shrink-0 border-t border-hairline pt-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              <IconBtn label="Sign out" onClick={() => void auth.signOutAndGo()}>
                <SignOutGlyph />
              </IconBtn>
              <IconBtn
                className="hidden lg:flex"
                label="Expand navigation"
                onClick={toggleCollapsed}
              >
                <ChevronGlyph dir="right" />
              </IconBtn>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="flex min-w-0 flex-1 items-center gap-2" title={email || name}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-medium text-ink">
                    {initial}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-ink">{name}</span>
                    <span className="block truncate text-[11px] text-muted">{email}</span>
                  </span>
                </div>
                <IconBtn label="Sign out" onClick={() => void auth.signOutAndGo()}>
                  <SignOutGlyph />
                </IconBtn>
              </div>
              <div className="flex items-center justify-between px-1">
                <ThemeCycleButton />
                <IconBtn className="hidden lg:flex" label="Collapse navigation" onClick={toggleCollapsed}>
                  <ChevronGlyph dir="left" />
                </IconBtn>
              </div>
            </div>
          )}
        </div>
      </aside>
      {mobileOpen ? (
        <button
          className="fixed inset-0 z-20 bg-ink/30 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <main className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {/* Subtle Ambient Spherical Glows for Authentic Glass Refraction (Matches Reference Image) */}
        <div className="pointer-events-none fixed bottom-0 right-0 z-0 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-accent/15 via-orange-400/10 to-pink-400/10 blur-[100px] dark:from-accent/8 dark:via-purple-500/5 dark:to-transparent dark:blur-[130px]" aria-hidden="true" />

        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-hairline bg-canvas/95 px-3 backdrop-blur-md lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-ink hover:bg-surface-muted"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 7h14M5 12h14M5 17h14" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/" aria-label="FairSales home" className="text-inherit no-underline">
              <BrandWordmark />
            </Link>
          </div>
          <ThemeCycleButton />
        </header>
        <div className="mx-auto w-full min-w-0 max-w-[1200px] space-y-4 px-4 py-6 lg:px-10 lg:py-8">
          <Banners />
          {children ?? <Outlet />}
        </div>

        {location.pathname.startsWith("/app/inventory") && (
          <CopilotDrawer />
        )}
      </main>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  className = "flex",
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${className} h-10 w-10 items-center justify-center rounded-[8px] text-muted hover:bg-surface-muted hover:text-ink`}
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SignOutGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4M15 16l5-4-5-4M20 12H10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronGlyph({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d={dir === "right" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
