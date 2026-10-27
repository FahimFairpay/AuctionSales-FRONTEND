import type { CopartRecipeRules, FailurePage, PublicRecipe, RecipeWriteResult, ScrapeRun, ScrapeRunList } from "../types/api";
import type { RecipeFilters } from "../types/filters";
import { ApiError } from "./errors";
import { apiGet, apiSend } from "./client";

export function listScrapeRuns(day?: string): Promise<ScrapeRunList> {
  const params = new URLSearchParams();
  if (day) {
    params.set("day", day);
  }
  const suffix = params.toString();
  return apiGet<ScrapeRunList>(suffix ? `/admin/scrape-runs?${suffix}` : "/admin/scrape-runs");
}

export function getScrapeRun(scrapeRunId: string): Promise<ScrapeRun> {
  return apiGet<ScrapeRun>(`/admin/scrape-runs/${encodeURIComponent(scrapeRunId)}`);
}

export async function unlockAdminRecipe(
  pin: string,
  source: "IAAI" | "COPART" = "IAAI",
): Promise<PublicRecipe> {
  const body = { pin, source };
  try {
    return await apiSend<PublicRecipe>("/admin/scrape-recipe", "POST", body);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      return apiSend<PublicRecipe>("/admin/scrape-recipe", "PUT", { ...body, preview: true });
    }
    throw err;
  }
}

export function putAdminRecipe(body: {
  pin: string;
  source?: "IAAI" | "COPART";
  filters?: RecipeFilters;
  rules?: CopartRecipeRules;
  newPin?: string;
}): Promise<RecipeWriteResult> {
  return apiSend<RecipeWriteResult>("/admin/scrape-recipe", "PUT", body);
}

export type FailureQuery = {
  source?: "all" | "desk" | "scrape";
  status?: string;
  day?: string;
  date?: string;
  cursor?: string;
};

export function toFailureSearch(query: FailureQuery = {}): URLSearchParams {
  const params = new URLSearchParams();
  if (query.source && query.source !== "all") {
    params.set("source", query.source);
  }
  if (query.status) {
    params.set("status", query.status);
  }
  if (query.day || query.date) {
    params.set("day", query.day || query.date!);
  }
  if (query.cursor) {
    params.set("cursor", query.cursor);
  }
  return params;
}

export async function listFailures(query: FailureQuery = {}): Promise<FailurePage> {
  const params = toFailureSearch(query);
  const suffix = params.toString();
  const path = suffix ? `/admin/failures?${suffix}` : "/admin/failures";
  try {
    return await apiGet<FailurePage>(path);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
      params.set("inbox", "1");
      return apiGet<FailurePage>(`/admin/scrape-runs?${params.toString()}`);
    }
    throw err;
  }
}
