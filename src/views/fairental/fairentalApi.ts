import { apiGet, apiSend } from "@/api/client";
import { publicApiGet } from "@/api/publicClient";
import { toSearchParams, type FairentalFilters } from "./filters";

export type FairentalCard = {
  vin: string;
  title: string;
  price: number;
  year: number;
  make: string;
  model: string;
  bodyStyle: string;
  exteriorColor: string;
  interiorColor: string;
  coverUrl: string;
  version?: string;
  isListed?: boolean;
  isSold?: boolean;
};

export type FairentalImage = {
  imageId: string;
  order: number;
  url: string;
  key?: string;
  ready?: boolean;
};

export type FairentalVersion = {
  version: string;
  isListed: boolean;
  isSold: boolean;
  updatedAt?: string;
  updatedByName?: string;
};

export type FairentalDetail = FairentalCard & {
  description: string;
  images: FairentalImage[];
  category?: string;
  createdByName?: string;
  updatedByName?: string;
  updatedAt?: string;
  versions?: FairentalVersion[];
};

export type FacetValue = { value: string; count: number };

export type FairentalFacets = {
  makes: FacetValue[];
  models: FacetValue[];
  bodyStyles: FacetValue[];
  exteriorColors: FacetValue[];
  interiorColors: FacetValue[];
  price: { min: number; max: number };
  year: { min: number; max: number };
  total: number;
};

export type FairentalPage = {
  items: FairentalCard[];
  nextCursor: string | null;
  truncated: boolean;
};

function query(filters: FairentalFilters, admin: boolean, cursor?: string): string {
  const params = toSearchParams(filters, admin);
  if (cursor) params.set("cursor", cursor);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function listFairental(filters: FairentalFilters, admin: boolean, cursor?: string): Promise<FairentalPage> {
  const path = `${admin ? "/admin/fairental" : "/public/fairental"}${query(filters, admin, cursor)}`;
  return admin ? apiGet<FairentalPage>(path) : publicApiGet<FairentalPage>(path);
}

export function fairentalFacets(filters: FairentalFilters, admin: boolean): Promise<FairentalFacets> {
  const path = `${admin ? "/admin/fairental/facets" : "/public/fairental/facets"}${query(filters, admin)}`;
  return admin ? apiGet<FairentalFacets>(path) : publicApiGet<FairentalFacets>(path);
}

export function publicFairental(vin: string): Promise<FairentalDetail> {
  return publicApiGet<FairentalDetail>(`/public/fairental/${encodeURIComponent(vin)}`);
}

export function adminFairental(vin: string, version?: string): Promise<FairentalDetail> {
  const suffix = version ? `?version=${encodeURIComponent(version)}` : "";
  return apiGet<FairentalDetail>(`/admin/fairental/${encodeURIComponent(vin)}${suffix}`);
}

export type FairentalDraft = {
  vin: string;
  title: string;
  make: string;
  model: string;
  year: number;
  bodyStyle: string;
  exteriorColor: string;
  interiorColor: string;
  price: number;
  description: string;
  isListed: boolean;
  isSold: boolean;
};

export function createFairental(draft: FairentalDraft): Promise<{ vin: string; version: string }> {
  return apiSend("/admin/fairental", "POST", draft);
}

export function patchFairental(vin: string, version: string, draft: Partial<FairentalDraft> & { imageOrder?: string[] }): Promise<{ vin: string; version: string }> {
  return apiSend(`/admin/fairental/${encodeURIComponent(vin)}/versions/${encodeURIComponent(version)}`, "PATCH", draft);
}

export async function uploadFairentalPhoto(vin: string, version: string, file: File): Promise<string> {
  const ticket = await apiSend<{ imageId: string; upload: { url: string; fields: Record<string, string> } }>(
    `/admin/fairental/${encodeURIComponent(vin)}/versions/${encodeURIComponent(version)}/images`,
    "POST",
    { contentType: file.type },
  );
  const form = new FormData();
  Object.entries(ticket.upload.fields).forEach(([key, value]) => form.append(key, value));
  form.append("file", file);
  const response = await fetch(ticket.upload.url, { method: "POST", body: form });
  if (!response.ok) {
    throw new Error("The photo could not be uploaded");
  }
  return ticket.imageId;
}
