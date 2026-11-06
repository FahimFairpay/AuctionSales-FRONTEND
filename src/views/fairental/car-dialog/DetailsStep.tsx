"use client";

import type { ReactNode } from "react";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import type { CarForm } from "./form";

const FIELDS: { key: Exclude<keyof CarForm, "isListed" | "isSold">; label: string }[] = [
  { key: "vin", label: "VIN" },
  { key: "title", label: "Title" },
  { key: "make", label: "Make" },
  { key: "model", label: "Model" },
  { key: "year", label: "Year" },
  { key: "bodyStyle", label: "Body style" },
  { key: "exteriorColor", label: "Exterior" },
  { key: "interiorColor", label: "Interior" },
  { key: "price", label: "Price" },
];

export function DetailsStep({
  form,
  locked,
  vinLocked,
  onChange,
  status,
}: {
  form: CarForm;
  locked: boolean;
  vinLocked: boolean;
  onChange: (next: CarForm) => void;
  status?: ReactNode;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {FIELDS.map((field) => (
          <Field key={field.key} label={field.label} htmlFor={`car-${field.key}`}>
            <Input
              id={`car-${field.key}`}
              className="h-9"
              value={String(form[field.key])}
              disabled={locked || (field.key === "vin" && vinLocked)}
              onChange={(event) => onChange({ ...form, [field.key]: event.target.value })}
            />
          </Field>
        ))}
        {status}
      </div>
      <div className="mt-2">
        <Field label="Description" htmlFor="car-description">
          <textarea
            id="car-description"
            value={form.description}
            disabled={locked}
            rows={2}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            className="h-14 w-full resize-none rounded-[8px] border border-hairline bg-surface px-3 py-2 text-sm text-ink disabled:opacity-60"
          />
        </Field>
      </div>
    </div>
  );
}
