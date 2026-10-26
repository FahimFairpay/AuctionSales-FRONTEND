"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createCrawlSchedule, deleteCrawlSchedule, listCrawlSchedules, patchCrawlSchedule } from "../../api/schedules";
import { Card } from "../../components/Card";
import { Dialog } from "../../components/Dialog";
import { EmptyState } from "../../components/EmptyState";
import { IconPencil, IconTrash } from "../../components/icons";
import { IconTool } from "../../components/IconTool";
import { PowerToggle } from "../../components/PowerToggle";
import { FairOrb } from "../../components/orb/FairOrb";
import { Table, type Column } from "../../components/Table";
import { CrawlHistoryDialog } from "../../features/scrape/CrawlHistoryDialog";
import { CrawlScheduleDialog, PlusButton, scheduleLabel } from "../../features/scrape/CrawlScheduleDialog";
import { RecipeButton } from "../../features/scrape/RecipeSheet";
import { RecipePinModal } from "../../features/scrape/RecipePinModal";
import { houseLabel } from "../../features/inventory/SourceGlassPill";
import type { CrawlSchedule } from "../../types/api";

export function ScrapeRunListPage() {
  const queryClient = useQueryClient();
  const schedules = useQuery({ queryKey: ["crawl-schedules"], queryFn: listCrawlSchedules });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(false);
  const [editor, setEditor] = useState<CrawlSchedule | null | "new">(null);
  const [pendingDelete, setPendingDelete] = useState<CrawlSchedule | null>(null);
  const [error, setError] = useState("");
  const rows = schedules.data ?? [];

  function refresh() {
    return queryClient.invalidateQueries({ queryKey: ["crawl-schedules"] });
  }

  const save = useMutation({
    mutationFn: (body: Omit<CrawlSchedule, "scheduleId">) =>
      editor && editor !== "new"
        ? patchCrawlSchedule(editor.scheduleId, body)
        : createCrawlSchedule({ ...body, enabled: body.enabled ?? true }),
    onSuccess: async () => {
      setEditor(null);
      setError("");
      await refresh();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not save the schedule."),
  });
  const toggle = useMutation({
    mutationFn: (row: CrawlSchedule) => patchCrawlSchedule(row.scheduleId, { enabled: !row.enabled }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (row: CrawlSchedule) => deleteCrawlSchedule(row.scheduleId),
    onSuccess: async () => {
      setPendingDelete(null);
      await refresh();
    },
  });

  const columns: Array<Column<CrawlSchedule>> = [
    { key: "name", header: "Schedule", cell: (row) => row.name },
    {
      key: "provider",
      header: "Provider",
      cell: (row) => <span className="text-sm text-ink">{houseLabel(row.source)}</span>,
    },
    { key: "when", header: "When", cell: (row) => scheduleLabel(row) },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <span className={row.enabled ? "text-success font-medium text-xs" : "text-danger font-medium text-xs"}>
          {row.enabled ? "Active" : "Disabled"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <span className="flex justify-end gap-1">
          <PowerToggle
            on={row.enabled}
            label={row.enabled ? "Disable schedule" : "Enable schedule"}
            onClick={() => toggle.mutate(row)}
          />
          <IconTool label={`Edit ${row.name}`} onClick={() => { setError(""); setEditor(row); }}>
            <IconPencil />
          </IconTool>
          <IconTool label={`Delete ${row.name}`} onClick={() => setPendingDelete(row)}>
            <IconTrash />
          </IconTool>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] lg:text-[34px] lg:leading-10">Schedules</h1>
          <p className="mt-2 text-sm text-muted">Company catalog scrapes.</p>
        </div>
        <div className="flex items-center gap-1">
          <IconTool label="Run history" onClick={() => setHistoryOpen(true)}>
            <HistoryIcon />
          </IconTool>
          <RecipeButton onClick={() => setRecipeOpen(true)} />
          <PlusButton onClick={() => { setError(""); setEditor("new"); }} />
        </div>
      </div>
      {schedules.isLoading ? <FairOrb state="working" /> : null}
      {schedules.error ? (
        <Card>
          <p className="text-sm text-danger">{schedules.error.message}</p>
        </Card>
      ) : null}
      {!schedules.isLoading && rows.length === 0 ? <EmptyState>No scrape schedules yet.</EmptyState> : null}
      {rows.length > 0 ? <Table columns={columns} rows={rows} rowKey={(row) => row.scheduleId} /> : null}
      <CrawlScheduleDialog
        open={editor !== null}
        initial={editor && editor !== "new" ? editor : null}
        pending={save.isPending}
        error={error}
        onClose={() => setEditor(null)}
        onSave={(body) => save.mutate(body)}
      />
      <CrawlHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <RecipePinModal open={recipeOpen} onClose={() => setRecipeOpen(false)} />
      <Dialog
        open={Boolean(pendingDelete)}
        title="Delete this schedule?"
        danger
        confirmLabel="Delete"
        pending={remove.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
      >
        {pendingDelete?.name || "This schedule"} will stop running.
      </Dialog>
    </div>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.2-5.5" strokeLinecap="round" />
      <path d="M4 4v4h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4.5l3 2" strokeLinecap="round" />
    </svg>
  );
}
