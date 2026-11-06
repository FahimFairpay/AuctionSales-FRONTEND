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

const SORTS = new Set(["newest", "oldest", "priceAsc", "priceDesc", "yearDesc", "yearAsc"]);

export const SORT_FIELDS = [
  { id: "added", label: "Added time", desc: "newest", asc: "oldest" },
  { id: "year", label: "Year", desc: "yearDesc", asc: "yearAsc" },
  { id: "price", label: "Price", desc: "priceDesc", asc: "priceAsc" },
] as const;

export function sortField(sort: string) {
  return SORT_FIELDS.find((field) => field.desc === sort || field.asc === sort) || SORT_FIELDS[0];
}

export function nextSort(current: string, fieldId: string): string {
  const field = SORT_FIELDS.find((item) => item.id === fieldId) || SORT_FIELDS[0];
  if (current === field.desc) return field.asc;
  return field.desc;
}

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
  filters.exteriors.forEach((value) => {
    const color = value.trim();
    if (color) params.append("exteriorColor", color);
  });
  filters.interiors.forEach((value) => {
    const color = value.trim();
    if (color) params.append("interiorColor", color);
  });
  if (filters.yearMin) params.set("yearMin", filters.yearMin);
  if (filters.yearMax) params.set("yearMax", filters.yearMax);
  if (filters.priceMin) params.set("priceMin", filters.priceMin);
  if (filters.priceMax) params.set("priceMax", filters.priceMax);
  if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
  if (admin && filters.includeHidden) params.set("includeHidden", "true");
  return params;
}

export function filterCount(filters: FairentalFilters): number {
  let count = filters.makes.length + filters.models.length + filters.bodies.length;
  if (filters.exteriors.length) count += 1;
  if (filters.interiors.length) count += 1;
  if (filters.yearMin || filters.yearMax) count += 1;
  if (filters.priceMin || filters.priceMax) count += 1;
  if (filters.includeHidden) count += 1;
  return count;
}

export function dollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function toggleValue(values: string[], value: string, limit = 99): string[] {
  if (values.includes(value)) return values.filter((item) => item !== value);
  if (values.length >= limit) return values;
  return [...values, value];
}
