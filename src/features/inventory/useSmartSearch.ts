"use client";

import { useEffect, useRef, useState } from "react";
import type { InventoryQuery } from "./query";

const SEARCH_PAUSE_MS = 800;

/** Keep the letters still being typed. Only an unrelated query replaces the box. */
export function reconcileSearchDraft(current: string, committed: string): string {
  const trimmed = current.trim();
  if (trimmed === committed) return current;
  if (trimmed.startsWith(committed) || committed.startsWith(trimmed)) return current;
  return committed;
}

export function useSmartSearch({
  query,
  onChange,
}: {
  query: InventoryQuery;
  onChange: (next: InventoryQuery) => void;
}) {
  const committed = query.modelContains || "";
  const [draft, setDraft] = useState(committed);
  const draftRef = useRef(draft);
  const queryRef = useRef(query);
  const onChangeRef = useRef(onChange);
  draftRef.current = draft;
  queryRef.current = query;
  onChangeRef.current = onChange;

  useEffect(() => {
    setDraft((current) => reconcileSearchDraft(current, committed));
  }, [committed]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = draftRef.current.trim();
      const currentQuery = queryRef.current;
      if (trimmed === (currentQuery.modelContains || "")) return;
      onChangeRef.current({ ...currentQuery, modelContains: trimmed || undefined });
    }, SEARCH_PAUSE_MS);
    return () => window.clearTimeout(handle);
  }, [draft]);

  return { draft, setDraft };
}
