export type CarForm = {
  vin: string;
  title: string;
  make: string;
  model: string;
  year: string;
  bodyStyle: string;
  exteriorColor: string;
  interiorColor: string;
  price: string;
  description: string;
  isListed: boolean;
  isSold: boolean;
};

export type CarStatus = "listed" | "unlisted" | "sold";

export const STATUS_OPTIONS: { id: CarStatus; label: string }[] = [
  { id: "listed", label: "Listed" },
  { id: "unlisted", label: "Unlisted" },
  { id: "sold", label: "Sold" },
];

export function statusOf(form: Pick<CarForm, "isListed" | "isSold">): CarStatus {
  if (form.isSold) return "sold";
  return form.isListed ? "listed" : "unlisted";
}
