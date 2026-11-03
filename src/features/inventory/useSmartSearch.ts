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
    (key: keyof SmartIntentApplied, val?: string | number) => {
      const next: InventoryQuery = { ...query };
      if (key === "makes") {
        if (val && next.makes) {
          next.makes = next.makes.filter((m) => m !== val);
          if (next.makes.length === 0) next.makes = undefined;
        } else {
          next.makes = undefined;
        }
      } else if (key === "fuelTypes") {
        if (val && next.fuelTypes) {
          next.fuelTypes = next.fuelTypes.filter((f) => f !== val);
          if (next.fuelTypes.length === 0) next.fuelTypes = undefined;
        } else {
          next.fuelTypes = undefined;
        }
      } else if (key === "vehicleTypes") {
        if (val && next.vehicleTypes) {
          next.vehicleTypes = next.vehicleTypes.filter((t) => t !== val);
          if (next.vehicleTypes.length === 0) next.vehicleTypes = undefined;
        } else {
          next.vehicleTypes = undefined;
        }
      } else if (key === "startCodes") {
        next.startCodes = undefined;
      } else if (key === "yearMin" || key === "yearMax") {
        next.yearMin = undefined;
        next.yearMax = undefined;
      } else if (key === "odoMax") {
        next.odoMax = undefined;
      } else if (key === "modelContains") {
        setDraft("");
        next.modelContains = undefined;
      }
      onChange(next);
    },
    [query, onChange]
  );

  return {
    draft,
    setDraft,
    activeIntent,
    clearIntent,
    removeFacet,
  };
}

