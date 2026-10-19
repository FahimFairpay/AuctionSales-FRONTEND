/**
 * Browser telemetry for the live site. Posts timezone, language, screen, and referrer.
 */
const TRACKER_PATH = "/public/visitors/track";
const STORAGE_KEY = "fps_visitor_tracked_ts";
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export interface VisitorTelemetryPayload {
  page: string;
  timeZone: string;
  language: string;
  screen: string;
  referrer: string;
  isUsLikely: boolean;
  sessionFirstTouch: boolean;
  reset?: boolean;
}

/**
 * Returns the resolved full API endpoint URL for visitor tracking.
 * Prefers the same-origin /api proxy route in the browser to eliminate CORS preflight latency.
 */
export function getTrackerEndpoint(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return "/api/public/visitors/track";
  }
  const envApiBase =
    process.env.NEXT_PUBLIC_API_BASE ||
    "https://0rjze2z0jh.execute-api.us-east-1.amazonaws.com/v1";
  const base = envApiBase.replace(/\/+$/, "");
  return base ? `${base}${TRACKER_PATH}` : TRACKER_PATH;
}

/**
 * Tracks current visitor telemetry without blocking the UI thread or DOM rendering.
 */
export function trackVisitorTelemetry(pagePath?: string): void {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const now = Date.now();
    // Allow URL query ?reset=1 or ?test=1 to force reset cooldown for instant re-testing on mobile/desktop
    const searchStr = window.location?.search || "";
    const isReset = /[?&](?:reset|test)=1/i.test(searchStr);
    if (isReset) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage exceptions
      }
    }

    let storedTime = 0;
    try {
      storedTime = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    } catch {
      storedTime = 0;
    }

    const sessionFirstTouch = isReset || !storedTime || now - storedTime > SIX_HOURS_MS;

    // Browser telemetry collection
    let timeZone = "Unknown";
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
    } catch {
      timeZone = "Unknown";
    }

    const language = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
    const screenWidth = window.screen?.width || 0;
    const screenHeight = window.screen?.height || 0;
    const screen = `${screenWidth}x${screenHeight}`;
    const referrer = document.referrer ? document.referrer : "direct";
    const isUsLikely = timeZone.startsWith("America/") || timeZone.startsWith("US/");

    // If first touch or 6-hour window expired, update timestamp
    if (sessionFirstTouch) {
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } catch {
        // Ignore quota or private-browsing storage exceptions
      }
    }

    const payload: VisitorTelemetryPayload = {
      page: pagePath || window.location.pathname || "/",
      timeZone,
      language,
      screen,
      referrer,
      isUsLikely,
      sessionFirstTouch,
      ...(isReset ? { reset: true } : {}),
    };

    const endpoint = getTrackerEndpoint();
    const fallbackEndpoint = "https://0rjze2z0jh.execute-api.us-east-1.amazonaws.com/v1/public/visitors/track";
    const body = JSON.stringify(payload);

    // Non-blocking asynchronous dispatch
    if (typeof fetch === "function") {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Fallback to direct API Gateway URL if proxy route is unavailable
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([body], { type: "application/json" });
          navigator.sendBeacon(fallbackEndpoint, blob);
        } else {
          fetch(fallbackEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
          }).catch(() => {});
        }
      });
    } else if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
    }
  } catch {
    // Fail silently: telemetry must never degrade client experience
  }
}
