export type FairentalFilters = {
  q: string;
  makes: string[];
  models: string[];
  bodies: string[];
  exteriors: string[];
  interiors: string[];
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  sort: string;
  includeHidden: boolean;
};

export const EMPTY_FILTERS: FairentalFilters = {
  q: "",
  makes: [],
  models: [],
  bodies: [],
  exteriors: [],
  interiors: [],
  yearMin: "",
  yearMax: "",
  priceMin: "",
  priceMax: "",
  sort: "newest",
  includeHidden: false,
};

const SORTS = new Set(["newest", "priceAsc", "priceDesc", "yearDesc", "yearAsc"]);

export function readFilters(params: { getAll(name: string): string[]; get(name: string): string | null }): FairentalFilters {
  const sort = params.get("sort") || "newest";
  return {
    q: params.get("q") || "",
    makes: params.getAll("make").filter(Boolean).slice(0, 5),
    models: params.getAll("model").filter(Boolean),
    bodies: params.getAll("bodyStyle").filter(Boolean),
    exteriors: params.getAll("exteriorColor").filter(Boolean),
    interiors: params.getAll("interiorColor").filter(Boolean),
    yearMin: params.get("yearMin") || "",
    yearMax: params.get("yearMax") || "",
    priceMin: params.get("priceMin") || "",
    priceMax: params.get("priceMax") || "",
    sort: SORTS.has(sort) ? sort : "newest",
    includeHidden: params.get("includeHidden") === "true",
  };
}

export function toSearchParams(filters: FairentalFilters, admin: boolean): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  filters.makes.forEach((value) => params.append("make", value));
  if (filters.makes.length) filters.models.forEach((value) => params.append("model", value));
  filters.bodies.forEach((value) => params.append("bodyStyle", value));
  filters.exteriors.forEach((value) => params.append("exteriorColor", value));
  filters.interiors.forEach((value) => params.append("interiorColor", value));
  if (filters.yearMin) params.set("yearMin", filters.yearMin);
  if (filters.yearMax) params.set("yearMax", filters.yearMax);
  if (filters.priceMin) params.set("priceMin", filters.priceMin);
  if (filters.priceMax) params.set("priceMax", filters.priceMax);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (admin && filters.includeHidden) params.set("includeHidden", "true");
  return params;
}

export function toggleValue(values: string[], value: string, limit = 99): string[] {
  if (values.includes(value)) return values.filter((item) => item !== value);
  if (values.length >= limit) return values;
  return [...values, value];
}
