"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import NextLink from "next/link";
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from "next/navigation";

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to?: string;
  href?: string;
  replace?: boolean;
}

export function Link({ to, href, replace, ...props }: LinkProps) {
  const target = to || href || "#";
  return <NextLink href={target} replace={replace} {...props} />;
}

export interface NavLinkProps extends Omit<LinkProps, "className"> {
  className?: string | ((props: { isActive: boolean }) => string);
  end?: boolean;
}

export function NavLink({
  to,
  href,
  className,
  end = false,
  ...props
}: NavLinkProps) {
  const pathname = useNextPathname() || "";
  const target = to || href || "#";

  const isActive = useMemo(() => {
    if (end) {
      return pathname === target;
    }
    return pathname === target || (target !== "/" && pathname.startsWith(target));
  }, [pathname, target, end]);

  const computedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <NextLink
      href={target}
      className={computedClassName}
      aria-current={isActive ? "page" : undefined}
      {...props}
    />
  );
}

export type To = string | number | { pathname?: string; search?: string; hash?: string };

let globalNavState: any = null;
let globalNavTarget: string | null = null;
const NAV_STATE_SESSION_PREFIX = "fps_nav_state_";

export function useNavigate() {
  const router = useNextRouter();

  return (
    to: To,
    options?: { replace?: boolean; state?: any }
  ) => {
    if (typeof to === "number") {
      if (to === -1) {
        router.back();
      }
      return;
    }
    const pathStr =
      typeof to === "string"
        ? to
        : `${to.pathname || ""}${to.search || ""}${to.hash || ""}`;

    if (options?.state !== undefined) {
      globalNavState = options.state;
      globalNavTarget = pathStr.split("?")[0].split("#")[0];
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            `${NAV_STATE_SESSION_PREFIX}${globalNavTarget}`,
            JSON.stringify(options.state)
          );
        } catch {}
      }
    }

    if (options?.replace) {
      router.replace(pathStr);
    } else {
      router.push(pathStr);
    }
  };
}

export function useLocation() {
  const pathname = useNextPathname() || "";
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";

  const state = useMemo(() => {
    if (globalNavTarget && pathname === globalNavTarget && globalNavState !== null) {
      return globalNavState;
    }
    if (typeof window !== "undefined") {
      try {
        const item = sessionStorage.getItem(`${NAV_STATE_SESSION_PREFIX}${pathname}`);
        if (item) {
          return JSON.parse(item);
        }
      } catch {}
    }
    return null;
  }, [pathname]);

  return useMemo(
    () => ({
      pathname,
      search,
      hash: typeof window !== "undefined" ? window.location.hash : "",
      state,
      key: "default",
    }),
    [pathname, search, state]
  );
}

export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string>>(): T {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (
    nextInit:
      | URLSearchParams
      | Record<string, string | number | boolean | undefined>
      | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean }
  ) => void,
] {
  const nextSearchParams = useNextSearchParams();
  const router = useNextRouter();
  const pathname = useNextPathname() || "";

  const currentParams = useMemo(() => {
    return new URLSearchParams(nextSearchParams ? nextSearchParams.toString() : "");
  }, [nextSearchParams]);

  const setSearchParams = (
    nextInit:
      | URLSearchParams
      | Record<string, string | number | boolean | undefined>
      | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean }
  ) => {
    let next: URLSearchParams;
    if (typeof nextInit === "function") {
      next = nextInit(new URLSearchParams(currentParams));
    } else if (nextInit instanceof URLSearchParams) {
      next = nextInit;
    } else {
      next = new URLSearchParams();
      Object.entries(nextInit).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          next.set(key, String(val));
        }
      });
    }

    const qs = next.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };

  return [currentParams, setSearchParams];
}

export function Navigate({
  to,
  replace = false,
}: {
  to: string;
  replace?: boolean;
}) {
  const router = useNextRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);

  return null;
}

const OutletContext = createContext<React.ReactNode | null>(null);

export function OutletProvider({
  children,
  outlet,
}: {
  children: React.ReactNode;
  outlet: React.ReactNode;
}) {
  return (
    <OutletContext.Provider value={outlet}>{children}</OutletContext.Provider>
  );
}

export function Outlet() {
  const outlet = useContext(OutletContext);
  return <>{outlet}</>;
}

export interface Blocker {
  state: "unblocked" | "blocked";
  reset?: () => void;
  proceed?: () => void;
}

export function useBlocker(shouldBlock: boolean): Blocker {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!shouldBlock) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldBlock]);

  return {
    state: blocked ? "blocked" : "unblocked",
    reset: () => setBlocked(false),
    proceed: () => setBlocked(false),
  };
}
