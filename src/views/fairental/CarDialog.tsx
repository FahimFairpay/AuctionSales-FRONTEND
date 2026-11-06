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
import { PhotoPicker } from "./PhotoPicker";
import { glass } from "./swatches";

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
    <label className="block text-[12px] text-[var(--fs-muted)]">
      {label}
      <input
        value={String(form[key])}
        disabled={locked || (key === "vin" && kind === "edit")}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        className="mt-1 w-full rounded-2xl border border-[var(--fs-line)] bg-[var(--fs-paper)] px-3 py-2 text-[14px] text-[var(--fs-ink)] disabled:opacity-60"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center">
      <div className={`${glass} max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[24px] text-[var(--fs-ink)]">{kind === "create" ? "New car" : form.title || "Fairental car"}</h2>
          <button type="button" onClick={onClose} className="text-[13px] text-[var(--fs-muted)]">Close</button>
        </div>
        {error ? <p className="mb-3 text-[13px] text-[var(--fs-claude-orange)]">{error}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
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
        <label className="mt-3 block text-[12px] text-[var(--fs-muted)]">
          Description
          <textarea
            value={form.description}
            disabled={locked}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="mt-1 min-h-24 w-full rounded-2xl border border-[var(--fs-line)] bg-[var(--fs-paper)] px-3 py-2 text-[14px]"
          />
        </label>
        <p className="mt-3 text-[12px] text-[var(--fs-muted)]">Customers will see this after the first photo.</p>
        <div className="mt-3">
          <PhotoPicker
            images={images.filter((image) => !removed.includes(image.imageId))}
            files={files}
            failed={failed}
            locked={locked}
            onFiles={(next) => setFiles((current) => [...current, ...next])}
            onRemoveStored={(imageId) => setRemoved((current) => [...current, imageId])}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
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
          <ul className="mt-4 space-y-1 text-[12px] text-[var(--fs-text-sub)]">
            {versions.map((row) => (
              <li key={row.version}>
                <button type="button" className="underline" onClick={() => void openVersion(row.version)}>
                  {row.version}
                </button>
                {" "}{row.isSold ? "Sold" : row.isListed ? "Listed" : "Unlisted"} · {row.updatedByName || "Fairental"}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 flex justify-between gap-3">
          {kind === "edit" && vin && !locked ? (
            <button type="button" className="text-[13px] text-[var(--fs-claude-orange)]" onClick={() => applyRow({ ...formToDetail(), images }, true)}>
              Add this car again
            </button>
          ) : <span />}
          {locked ? null : (
            <button type="button" disabled={saving} onClick={() => void save()} className="rounded-full bg-[var(--fs-claude-orange)] px-4 py-2 text-[13px] text-white disabled:opacity-60">
              {saving ? "Saving" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
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
