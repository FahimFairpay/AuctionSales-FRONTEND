"use client";

import { useState, useEffect } from "react";
import type { InventoryQuery } from "./query";

export function useSmartSearch({
  query,
  onChange,
}: {
  query: InventoryQuery;
  onChange: (next: InventoryQuery) => void;
}) {
  const [draft, setDraft] = useState(query.modelContains || "");

  useEffect(() => {
    setDraft(query.modelContains || "");
  }, [query.modelContains]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft === (query.modelContains || "")) return;
      onChange({ ...query, modelContains: draft || undefined });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draft, query, onChange]);

  return { draft, setDraft };
}
