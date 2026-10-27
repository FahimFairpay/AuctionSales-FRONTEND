"use client";

import { Link } from "@/compat/router";
import { InventoryThumb } from "../../../features/inventory/InventoryThumb";
import { loadLotShots } from "../../../features/inventory/loadLotShots";
import { Pill } from "../../../components/Pill";
import { formatClock } from "../../../date/chicago";
import { paths } from "../../../routes/paths";
import type { ActivityLog, InventoryItem, WatchlistSummary } from "../../../types/api";

function deskTone(status?: string): "success" | "danger" | "warning" | "accent" | "neutral" {
  const value = String(status || "").toUpperCase();
  if (value === "COMPLETED" || value === "SUCCEEDED") {
    return "success";
  }
  if (value === "FAILED" || value === "ANALYSIS_FAILED") {
    return "danger";
  }
  if (value === "RUNNING") {
    return "accent";
  }
  if (value === "PARTIAL" || value === "FALLBACK") {
    return "warning";
  }
  return "neutral";
}

export function LiveLotsStrip({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.slice(0, 6).map((item) => {
        const meta = [item.primaryDamage, item.vehicleScore != null ? `Score ${item.vehicleScore}` : null]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={item.stockNumber}>
            <Link
              to={paths.inventoryItem(item.stockNumber)}
              className="group block overflow-hidden rounded-[8px] border border-hairline bg-surface hover:border-accent/40"
            >
              <InventoryThumb
                src={item.imageUrl}
                title={item.title}
                className="aspect-[16/10] w-full"
                loadShots={() => loadLotShots(item.stockNumber, "app")}
              />
              <div className="space-y-0.5 px-2.5 py-2">
                <p className="line-clamp-2 font-serif text-[14px] leading-5 tracking-[-0.02em] text-ink group-hover:text-accent">
                  {item.title || item.stockNumber}
                </p>
                {meta ? <p className="truncate text-[11px] text-muted">{meta}</p> : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function HomeWatchlists({ rows }: { rows: WatchlistSummary[] }) {
  return (
    <ul className="overflow-hidden rounded-[8px] border border-hairline bg-surface">
      {rows.map((row, index) => (
        <li key={row.watchlistId} className={index > 0 ? "border-t border-hairline" : ""}>
          <Link to={paths.watchlist(row.watchlistId)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-muted">
            <span className="min-w-0 flex-1 truncate text-sm text-ink">{row.name || "Untitled"}</span>
            <Pill tone={deskTone(row.lastRunStatus)}>{row.lastRunStatus || "Yet to run"}</Pill>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomeTodayLogs({
  rows,
  onOpen,
}: {
  rows: ActivityLog[];
  onOpen: (row: ActivityLog) => void;
}) {
  return (
    <ul className="overflow-hidden rounded-[8px] border border-hairline bg-surface">
      {rows.slice(0, 5).map((row, index) => (
        <li key={row.logId} className={index > 0 ? "border-t border-hairline" : ""}>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-muted"
            onClick={() => onOpen(row)}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-ink">{row.watchlistName || row.watchlistId.slice(0, 8)}</span>
              <span className="mt-0.5 block text-[11px] text-muted">
                {row.completedAt || row.startedAt ? formatClock(row.completedAt || row.startedAt) : "—"}
              </span>
            </span>
            <Pill tone={deskTone(row.status)}>{row.status || "—"}</Pill>
          </button>
        </li>
      ))}
    </ul>
  );
}
