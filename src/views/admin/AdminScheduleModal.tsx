"use client";

import React, { useState } from "react";
import type { AdminSchedule, AuctionSource } from "../../types/api";
import { ProviderChoice } from "../../features/inventory/SourceGlassPill";

export interface AdminScheduleModalProps {
  initialData: AdminSchedule | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminScheduleModal: React.FC<AdminScheduleModalProps> = ({
  initialData,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [source, setSource] = useState<AuctionSource>(initialData?.source || "COPART");
  const [cronExpression, setCronExpression] = useState(
    initialData?.cronExpression || "cron(0 14 ? * MON-FRI *)"
  );
  const [timezone, setTimezone] = useState(initialData?.timezone || "America/Chicago");
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const url = initialData
        ? `/api/admin/schedules/${initialData.scheduleId}`
        : "/api/admin/schedules";
      const method = initialData ? "PUT" : "POST";

      const payload = {
        name,
        source,
        cronExpression,
        timezone,
        enabled,
        recipeId: `RECIPE#${source}`,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || "Failed to save crawl schedule");
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 backdrop-blur-[8px]">
      <div className="relative w-full max-w-lg rounded-[12px] border border-hairline bg-surface p-6 shadow-2xl">
        <h2 className="mb-1 font-serif text-xl text-ink">
          {initialData ? "Edit crawl schedule" : "New crawl schedule"}
        </h2>
        <p className="mb-5 text-xs text-muted">
          Set the house and when this crawl should start.
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-[8px] border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Schedule name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-[8px] border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              placeholder="Copart morning crawl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Provider</label>
              <ProviderChoice value={source} onChange={(next) => next && setSource(next)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
                className="w-full rounded-[8px] border border-hairline bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink">EventBridge cron</label>
            <input
              type="text"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              required
              className="w-full rounded-[8px] border border-hairline bg-surface px-3.5 py-2.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
              placeholder="cron(0 14 ? * MON-FRI *)"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enabledCheck"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-hairline text-accent focus:ring-0"
            />
            <label htmlFor="enabledCheck" className="cursor-pointer select-none text-sm text-ink">
              Enable this schedule now
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-hairline pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
