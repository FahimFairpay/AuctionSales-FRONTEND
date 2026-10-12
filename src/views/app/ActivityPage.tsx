"use client";

import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "@/compat/router";
import { listHistory } from "../../api/history";
import { useAuth } from "../../auth/AuthProvider";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { FairOrb } from "../../components/orb/FairOrb";
import { clampToChicagoToday, chicagoTodayDate, formatChicagoLong } from "../../date/chicago";
import { ActivityPicksModal } from "../../features/activity/ActivityPicksModal";
import { DateStepper } from "../../features/activity/DateStepper";
import { LogTable } from "../../features/activity/LogTable";
import { PeopleFilter } from "../../features/activity/PeopleFilter";
import { POLLING_STATUSES } from "../../features/watchlists/helpers";
import { paths } from "../../routes/paths";

function parseUserIds(raw: string | null): string[] {
  if (!raw) {
    return [];
  }
  return raw.split(",").map((part) => part.trim()).filter(Boolean);
}

export function ActivityPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const logId = (params.get("log") || "").trim();
  const requested = /^\d{4}-\d{2}-\d{2}$/.test(params.get("date") || "")
    ? params.get("date")!
    : chicagoTodayDate();
  const date = clampToChicagoToday(requested);
  const userIds = auth.isAdmin ? parseUserIds(params.get("userId")) : [];

  function setDate(next: string) {
    const nextParams = new URLSearchParams(params);
    nextParams.set("date", clampToChicagoToday(next));
    setParams(nextParams, { replace: true });
  }

  function setUserIds(next: string[]) {
    const nextParams = new URLSearchParams(params);
    if (next.length === 0) {
      nextParams.delete("userId");
    } else {
      nextParams.set("userId", next.join(","));
    }
    setParams(nextParams, { replace: true });
  }

  function closePicks() {
    const nextParams = new URLSearchParams(params);
    nextParams.delete("log");
    navigate({ pathname: paths.activity, search: nextParams.toString() }, { replace: true });
  }

  const logs = useQuery({
    queryKey: ["logs", { date, userIds }],
    queryFn: () => listHistory({ date, userIds: auth.isAdmin ? userIds : undefined }),
    refetchInterval: (query) => {
      const rows = query.state.data ?? [];
      return rows.some((row) => POLLING_STATUSES.has(String(row.status))) ? 10_000 : false;
    },
  });
  const rows = logs.data ?? [];

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <h1 className="min-w-0 truncate font-serif text-[28px] leading-9 tracking-[-0.03em] lg:text-[34px] lg:leading-10">
            History
          </h1>
          <div className="flex shrink-0 items-center gap-1.5">
            <DateStepper date={date} onChange={setDate} />
            {auth.isAdmin ? <PeopleFilter align="end" value={userIds} onChange={setUserIds} /> : null}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">Daily run history.</p>
      </div>
      <p className="text-xs text-muted">
        {rows.length} {rows.length === 1 ? "run" : "runs"} · {formatChicagoLong(date)}
        {userIds.length > 0 ? ` · ${userIds.length} ${userIds.length === 1 ? "desk" : "desks"}` : ""}
      </p>
      {logs.isLoading ? <FairOrb state="working" /> : null}
      {logs.error ? (
        <Card>
          <p className="text-sm text-danger">{logs.error.message}</p>
        </Card>
      ) : null}
      {!logs.isLoading && rows.length === 0 ? (
        <EmptyState>No runs on {formatChicagoLong(date)}.</EmptyState>
      ) : null}
      {rows.length > 0 ? <LogTable rows={rows} showOwner={auth.isAdmin} /> : null}
      {logId ? <ActivityPicksModal logId={logId} onClose={closePicks} /> : null}
    </div>
  );
}
