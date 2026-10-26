"use client";

import React, { useEffect, useState } from "react";
import type { AdminSchedule } from "../../types/api";
import { houseLabel } from "../../features/inventory/SourceGlassPill";
import { AdminScheduleModal } from "./AdminScheduleModal";

export const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AdminSchedule | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/schedules");
      const data = await res.json();
      setSchedules(data.data || data.schedules || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Failed to load schedules", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleTriggerNow = async (scheduleId: string) => {
    setTriggeringId(scheduleId);
    try {
      const res = await fetch(`/api/admin/schedules/${scheduleId}/trigger`, { method: "POST" });
      if (res.ok) {
        alert("Crawler execution successfully dispatched to Step Functions!");
        fetchSchedules();
      } else {
        const body = await res.json().catch(() => ({}));
        alert("Trigger failed: " + (body.message || "Unknown error"));
      }
    } catch (e: any) {
      alert("Failed to trigger crawler execution: " + e.message);
    } finally {
      setTriggeringId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] text-ink">Crawler schedules</h1>
          <p className="mt-1 text-sm text-muted">
            Automated crawls for Copart and IAAI.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedSchedule(null);
            setIsModalOpen(true);
          }}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          Add crawl schedule
        </button>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-hairline bg-surface shadow-[var(--glass-card-shadow)]">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted">Loading crawl schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted">
            No crawl schedules yet. Add one to start.
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                <th className="px-6 py-3">Schedule</th>
                <th className="px-6 py-3">House</th>
                <th className="px-6 py-3">Cron</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-sm text-ink">
              {schedules.map((item) => (
                  <tr key={item.scheduleId} className="hover:bg-surface-muted">
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-ink">{houseLabel(item.source)}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted">
                      <div>{item.cronExpression}</div>
                      <div className="text-[11px]">{item.timezone || "America/Chicago"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.enabled ? (
                        <span className="text-xs font-medium text-success">Active</span>
                      ) : (
                        <span className="text-xs font-medium text-muted">Paused</span>
                      )}
                    </td>
                    <td className="space-x-2 px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={triggeringId === item.scheduleId}
                        onClick={() => handleTriggerNow(item.scheduleId)}
                        className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
                      >
                        {triggeringId === item.scheduleId ? "Triggering..." : "Run now"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchedule(item);
                          setIsModalOpen(true);
                        }}
                        className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink hover:bg-surface-muted"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for creating / editing schedules */}
      {isModalOpen && (
        <AdminScheduleModal
          initialData={selectedSchedule}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSchedules();
          }}
        />
      )}
    </div>
  );
};
