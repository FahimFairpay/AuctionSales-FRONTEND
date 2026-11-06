"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/api/errors";
import {
  adminFairental,
  createFairental,
  patchFairental,
  uploadFairentalPhoto,
  type FairentalDetail,
  type FairentalDraft,
  type FairentalImage,
} from "./fairentalApi";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { IconTool } from "@/components/IconTool";
import { Input } from "@/components/Input";
import { PhotoPicker } from "./PhotoPicker";

type Kind = "create" | "edit" | "again";

const BLANK = {
  vin: "", title: "", make: "", model: "", year: "", bodyStyle: "",
  exteriorColor: "", interiorColor: "", price: "", description: "",
  isListed: false, isSold: false,
};

export function CarDialog({
  kind,
  vin,
  onClose,
  onSaved,
}: {
  kind: Kind;
  vin?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(BLANK);
  const [version, setVersion] = useState("");
  const [images, setImages] = useState<FairentalImage[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [versions, setVersions] = useState<FairentalDetail["versions"]>([]);
  const [locked, setLocked] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vin || kind === "create") return;
    let gone = false;
    adminFairental(vin).then((row) => {
      if (gone) return;
      applyRow(row, kind === "again");
    }).catch((err: unknown) => {
      if (!gone) setError(err instanceof ApiError ? err.message : "This car could not be opened");
    });
    return () => {
      gone = true;
    };
  }, [vin, kind]);

  function applyRow(row: FairentalDetail, again: boolean) {
    setVersions(row.versions || []);
    setVersion(again ? "" : row.version || "");
    setLocked(!again && !!row.isSold);
    setImages(again ? [] : row.images || []);
    setRemoved([]);
    setFiles([]);
    setForm({
      vin: row.vin,
      title: row.title || "",
      make: row.make || "",
      model: row.model || "",
      year: row.year ? String(row.year) : "",
      bodyStyle: row.bodyStyle || "",
      exteriorColor: row.exteriorColor || "",
      interiorColor: row.interiorColor || "",
      price: again ? "" : row.price ? String(row.price) : "",
      description: again ? "" : row.description || "",
      isListed: again ? false : !!row.isListed,
      isSold: false,
    });
  }

  async function openVersion(nextVersion: string) {
    if (!vin) return;
    const row = await adminFairental(vin, nextVersion);
    applyRow(row, false);
  }

  function draft(listed: boolean): FairentalDraft {
    return {
      vin: form.vin.trim(),
      title: form.title.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      bodyStyle: form.bodyStyle.trim(),
      exteriorColor: form.exteriorColor.trim(),
      interiorColor: form.interiorColor.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      isListed: listed,
      isSold: form.isSold,
    };
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const queued = files.length > 0;
      const wanted = form.isListed && !form.isSold;
      const payload = draft(queued ? false : wanted);
      const saved = kind === "edit" && version
        ? await patchFairental(form.vin, version, {
          ...payload,
          imageOrder: images.filter((image) => !removed.includes(image.imageId)).map((image) => image.imageId),
        })
        : await createFairental(payload);
      for (const file of files) {
        await uploadFairentalPhoto(saved.vin, saved.version, file);
      }
      if (queued) {
        await waitForReady(saved.vin, saved.version, wanted);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function waitForReady(savedVin: string, savedVersion: string, wanted: boolean) {
    const started = Date.now();
    while (Date.now() - started < 120000) {
      const row = await adminFairental(savedVin, savedVersion);
      const pending = (row.images || []).filter((image) => !image.ready);
      const stale = pending.filter(() => Date.now() - started >= 120000).map((image) => image.imageId);
      setImages(row.images || []);
      setFailed(stale);
      if (!pending.length) {
        if (wanted) await patchFairental(savedVin, savedVersion, { isListed: true });
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 3000));
    }
    const row = await adminFairental(savedVin, savedVersion);
    setFailed((row.images || []).filter((image) => !image.ready).map((image) => image.imageId));
  }

  const field = (key: keyof typeof form, label: string) => (
    <Field label={label} htmlFor={`car-${key}`}>
      <Input
        id={`car-${key}`}
        value={String(form[key])}
        disabled={locked || (key === "vin" && kind === "edit")}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
      />
    </Field>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-scrim backdrop-blur-[8px]" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fairental-car-title"
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-[16px] bg-surface p-5 shadow-2xl lg:bottom-auto lg:left-1/2 lg:right-auto lg:top-1/2 lg:max-h-[calc(100dvh-4rem)] lg:w-full lg:max-w-3xl lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[12px] lg:border lg:border-hairline lg:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-hairline lg:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="fairental-car-title" className="font-serif text-xl text-ink">
              {kind === "create" ? "New car" : form.title || "Fairental car"}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {locked ? "This version is sold and cannot be changed." : "Customers see a listed car after the first photo is ready."}
            </p>
          </div>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {field("vin", "VIN")}
          {field("title", "Title")}
          {field("make", "Make")}
          {field("model", "Model")}
          {field("year", "Year")}
          {field("bodyStyle", "Body style")}
          {field("exteriorColor", "Exterior")}
          {field("interiorColor", "Interior")}
          {field("price", "Price")}
        </div>
        <div className="mt-4">
          <Field label="Description" htmlFor="car-description">
            <textarea
              id="car-description"
              value={form.description}
              disabled={locked}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="min-h-24 w-full rounded-[8px] border border-hairline bg-surface px-3 py-2 text-sm text-ink disabled:opacity-60"
            />
          </Field>
        </div>
        <div className="mt-4">
          <PhotoPicker
            images={images.filter((image) => !removed.includes(image.imageId))}
            files={files}
            failed={failed}
            locked={locked}
            onFiles={(next) => setFiles((current) => [...current, ...next])}
            onRemoveStored={(imageId) => setRemoved((current) => [...current, imageId])}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isListed} disabled={locked || form.isSold} onChange={(event) => setForm({ ...form, isListed: event.target.checked })} />
            Listed
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isSold} disabled={locked || !version} onChange={(event) => setForm({ ...form, isSold: event.target.checked, isListed: event.target.checked ? false : form.isListed })} />
            Sold
          </label>
        </div>
        {versions && versions.length ? (
          <ul className="mt-4 space-y-1 text-sm text-muted">
            {versions.map((row) => (
              <li key={row.version}>
                <button type="button" className="text-ink underline" onClick={() => void openVersion(row.version)}>
                  {row.version}
                </button>
                {" "}{row.isSold ? "Sold" : row.isListed ? "Listed" : "Unlisted"} · {row.updatedByName || "Fairental"}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 flex items-center justify-between gap-3">
          {kind === "edit" && vin && !locked ? (
            <Button variant="ghost" onClick={() => applyRow({ ...formToDetail(), images }, true)}>
              Add this car again
            </Button>
          ) : <span />}
          {locked ? null : (
            <Button disabled={saving} onClick={() => void save()}>
              {saving ? "Saving" : "Save"}
            </Button>
          )}
        </div>
      </div>
    </>
  );

  function formToDetail(): FairentalDetail {
    return {
      ...draft(form.isListed),
      coverUrl: "",
      images,
      versions,
      version,
      description: form.description,
    };
  }
}
