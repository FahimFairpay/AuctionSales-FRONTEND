"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { InventoryQuery } from "./query";
import type { SmartIntentApplied } from "../../types/api";

export interface SmartSearchState {
  draft: string;
  setDraft: (text: string) => void;
  activeIntent: {
    summary?: string;
    applied?: SmartIntentApplied;
  } | null;
  clearIntent: () => void;
  removeFacet: (key: keyof SmartIntentApplied, val?: string | number) => void;
}

export function useSmartSearch({
  query,
  onChange,
  serverApplied,
  serverSummary,
}: {
  query: InventoryQuery;
  onChange: (next: InventoryQuery) => void;
  serverApplied?: SmartIntentApplied;
  serverSummary?: string;
}): SmartSearchState {
  const [draft, setDraft] = useState(query.modelContains || "");

  // Sync draft when query.modelContains changes externally
  useEffect(() => {
    setDraft(query.modelContains || "");
  }, [query.modelContains]);

  // Debounced update to parent
  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (draft === (query.modelContains || "")) return;
      onChange({ ...query, modelContains: draft || undefined });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draft, query, onChange]);

  const activeIntent = useMemo(() => {
    if (!serverSummary && (!serverApplied || Object.keys(serverApplied).length === 0)) {
      return null;
    }
    return {
      summary: serverSummary,
      applied: serverApplied,
    };
  }, [serverSummary, serverApplied]);

  const clearIntent = useCallback(() => {
    setDraft("");
    const next: InventoryQuery = { ...query, modelContains: undefined };
    if (serverApplied) {
      if (serverApplied.makes) next.makes = undefined;
      if (serverApplied.fuelTypes) next.fuelTypes = undefined;
      if (serverApplied.vehicleTypes) next.vehicleTypes = undefined;
      if (serverApplied.startCodes) next.startCodes = undefined;
      if (serverApplied.yearMin) next.yearMin = undefined;
      if (serverApplied.yearMax) next.yearMax = undefined;
      if (serverApplied.odoMax) next.odoMax = undefined;
    }
    onChange(next);
  }, [query, serverApplied, onChange]);

  const removeFacet = useCallback(
    (_key: keyof SmartIntentApplied, _value?: string | number) => {
      setDraft("");
      const next: InventoryQuery = { ...query, modelContains: undefined };
      if (serverApplied) {
        if (serverApplied.makes) next.makes = undefined;
        if (serverApplied.fuelTypes) next.fuelTypes = undefined;
        if (serverApplied.vehicleTypes) next.vehicleTypes = undefined;
        if (serverApplied.startCodes) next.startCodes = undefined;
        if (serverApplied.yearMin) next.yearMin = undefined;
        if (serverApplied.yearMax) next.yearMax = undefined;
        if (serverApplied.odoMax) next.odoMax = undefined;
      }
      onChange(next);
    },
    [query, serverApplied, onChange]
  );

  return {
    draft,
    setDraft,
    activeIntent,
    clearIntent,
    removeFacet,
  };
}

