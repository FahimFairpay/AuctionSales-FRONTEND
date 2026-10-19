"use client";

import type { ScrapeRun } from "../../types/api";
import { Pill } from "../../components/Pill";

const STALL_MS = 3 * 60 * 1000;

export function isHeartbeatStale(run: ScrapeRun, now = Date.now()): boolean {
  if (String(run.status || "").toUpperCase() !== "RUNNING" || !run.lastHeartbeatAt) {
    return false;
  }
  const stamp = new Date(run.lastHeartbeatAt).getTime();
  if (Number.isNaN(stamp)) {
    return false;
  }
  return now - stamp > STALL_MS;
}

export function RunStatusPill({ run }: { run: ScrapeRun }) {
  const status = String(run.status || "UNKNOWN").toUpperCase();
  const tone =
    status === "SUCCEEDED"
      ? "success"
      : status === "PARTIAL"
        ? "warning"
        : status === "FAILED"
          ? "danger"
          : status === "RUNNING"
            ? "accent"
            : "neutral";
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Pill tone={isHeartbeatStale(run) ? "warning" : tone}>{status}</Pill>
      {isHeartbeatStale(run) ? <Pill tone="warning">Heartbeat stale</Pill> : null}
    </span>
  );
}
