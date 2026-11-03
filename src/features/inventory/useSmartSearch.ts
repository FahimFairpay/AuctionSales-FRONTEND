"use client";

import { useEffect, useState } from "react";
import type { InventoryQuery } from "./query";

export function useSmartSearch({
  query,
  onChange,
}: {
  query: InventoryQuery;
  onChange: (next: InventoryQuery) => void;
}) {
  const committed = query.modelContains || "";
  const [draft, setDraft] = useState(committed);

  useEffect(() => {
    setDraft((current) => (current.trim() === committed ? current : committed));
  }, [committed]);

  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed === committed) return;
    const handle = window.setTimeout(() => {
      onChange({ ...query, modelContains: trimmed || undefined });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draft, committed, query, onChange]);

  return { draft, setDraft };
}
