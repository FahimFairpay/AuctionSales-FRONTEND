import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

describe("security proxy middleware", () => {
  it("attaches defensive HTTP security headers and CSP", () => {
    const req = new NextRequest("http://localhost:3000/app");
    const res = proxy(req);

    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("Permissions-Policy")).toContain("camera=()");

    const csp = res.headers.get("Content-Security-Policy");
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("vis.iaai.com");
    expect(csp).toContain("https://*.googletagmanager.com");
    expect(csp).toContain("https://*.google-analytics.com");
    expect(csp).toContain("https://*.analytics.google.com");
    expect(csp).toContain("https://*.g.doubleclick.net");
    expect(csp).toContain("https://pagead2.googlesyndication.com");
    expect(csp).toContain("frame-src 'self' https://www.googletagmanager.com https://td.doubleclick.net");
    expect(csp).toContain("https://*.clarity.ms");
    expect(csp).toContain("https://c.bing.com");
  });
});
