/**
 * visitorTracking.ts: Real-time browser telemetry & deduplicated visitor tracking for Next.js 16 (web-v2).
 * Captures timezone, language, screen resolution, and referrer, routing to /public/visitors/track.
 */
const TRACKER_PATH = "/public/visitors/track";
const SESSION_STORAGE_KEY = "fps_visitor_tracked";
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export interface VisitorTelemetryPayload {
  page: string;
  timeZone: string;
  language: string;
  screen: string;
  referrer: string;
  isUsLikely: boolean;
  sessionFirstTouch: boolean;
}

/**
 * Returns the resolved full API endpoint URL for visitor tracking.
 */
export function getTrackerEndpoint(): string {
  const envApiBase =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.VITE_API_BASE ||
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
    const storedTime = parseInt(sessionStorage.getItem(SESSION_STORAGE_KEY) || "0", 10);
    const sessionFirstTouch = !storedTime || now - storedTime > THIRTY_MINUTES_MS;

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

    // If first touch or session expired, update timestamp
    if (sessionFirstTouch) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, now.toString());
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
    };

    const endpoint = getTrackerEndpoint();
    const body = JSON.stringify(payload);

    // Non-blocking asynchronous dispatch
    if (typeof fetch === "function") {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Fallback to beacon on fetch rejection if available
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([body], { type: "application/json" });
          navigator.sendBeacon(endpoint, blob);
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
