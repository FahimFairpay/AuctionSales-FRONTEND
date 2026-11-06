"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/api/errors";
import { Button } from "@/components/Button";
import { IconTool } from "@/components/IconTool";
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
import { DetailsStep } from "./car-dialog/DetailsStep";
import { SoldConfirm } from "./car-dialog/SoldConfirm";
import { StatusMenu } from "./car-dialog/StatusMenu";
import { Stepper } from "./car-dialog/Stepper";
import { VersionMark } from "./car-dialog/VersionMark";
import { statusOf, type CarForm, type CarStatus } from "./car-dialog/form";

type Kind = "create" | "edit";

const BLANK: CarForm = {
  vin: "", title: "", make: "", model: "", year: "", bodyStyle: "",
  exteriorColor: "", interiorColor: "", price: "", description: "",
  isListed: true, isSold: false,
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
  const [step, setStep] = useState<1 | 2>(1);
  const [version, setVersion] = useState("");
  const [images, setImages] = useState<FairentalImage[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [locked, setLocked] = useState(false);
  const [failed, setFailed] = useState<string[]>([]);
  const [confirmSold, setConfirmSold] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const creating = !(kind === "edit" && version);
  const frozen = locked || form.isSold;
  const heading = [form.year, form.make, form.model].filter(Boolean).join(" ");

  useEffect(() => {
    if (!vin || kind === "create") return;
    let gone = false;
    adminFairental(vin).then((row) => {
      if (gone) return;
      applyRow(row);
    }).catch((err: unknown) => {
      if (!gone) setError(err instanceof ApiError ? err.message : "This car could not be opened");
    });
    return () => {
      gone = true;
    };
  }, [vin, kind]);

  function applyRow(row: FairentalDetail) {
    setVersion(row.version || "");
    setLocked(!!row.isSold);
    setImages(row.images || []);
    setRemoved([]);
    setFiles([]);
    setConfirmSold(false);
    setForm({
      vin: row.vin,
      title: row.title || "",
      make: row.make || "",
      model: row.model || "",
      year: row.year ? String(row.year) : "",
      bodyStyle: row.bodyStyle || "",
      exteriorColor: row.exteriorColor || "",
      interiorColor: row.interiorColor || "",
      price: row.price ? String(row.price) : "",
      description: row.description || "",
      isListed: !!row.isListed,
      isSold: !!row.isSold,
    });
  }

  function chooseStatus(next: CarStatus) {
    if (next === "sold") {
      setConfirmSold(true);
      return;
    }
    setForm({ ...form, isListed: next === "listed", isSold: false });
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
      isSold: creating ? false : form.isSold,
    };
  }

  async function save() {
    if (creating && files.length === 0) {
      setError("Add at least one photo.");
      return;
    }
    const selling = !creating && form.isSold;
    if (selling && (removed.length > 0 || files.length > 0)) {
      setError("A sold car keeps its photos.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const queued = files.length > 0;
      const wanted = creating ? true : form.isListed && !form.isSold;
      const payload = draft(queued ? false : wanted);
      const saved = kind === "edit" && version
        ? await patchFairental(form.vin, version, selling ? payload : {
          ...payload,
          imageOrder: images.filter((image) => !removed.includes(image.imageId)).map((image) => image.imageId),
        })
        : await createFairental(payload);
      for (const file of files) {
        await uploadFairentalPhoto(saved.vin, saved.version, file);
      }
      if (queued) await waitForReady(saved.vin, saved.version, wanted);
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
      setImages(row.images || []);
      setFailed(pending.filter(() => Date.now() - started >= 120000).map((image) => image.imageId));
      if (!pending.length) {
        if (wanted) await patchFairental(savedVin, savedVersion, { isListed: true });
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 3000));
    }
    const row = await adminFairental(savedVin, savedVersion);
    setFailed((row.images || []).filter((image) => !image.ready).map((image) => image.imageId));
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-scrim backdrop-blur-[8px]" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fairental-car-title"
        className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-[16px] bg-surface p-4 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[12px] sm:border sm:border-hairline sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id="fairental-car-title" className="flex min-w-0 items-baseline font-serif text-xl text-ink">
            <span className="truncate">{creating && !heading ? "New car" : heading || "Fairental car"}</span>
            {creating ? null : <VersionMark version={version} />}
          </h2>
          <IconTool label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </IconTool>
        </div>
        <Stepper step={step} />
        {error ? <p className="mb-2 text-sm text-danger">{error}</p> : null}
        {locked ? <p className="mb-2 text-sm text-muted">This version is sold and cannot be changed.</p> : null}
        {step === 1 ? (
          <DetailsStep
            form={form}
            locked={frozen}
            vinLocked={kind === "edit"}
            onChange={setForm}
            status={creating ? null : (
              <StatusMenu value={statusOf(form)} disabled={frozen} onChange={chooseStatus} />
            )}
          />
        ) : (
          <div className="space-y-3">
            <PhotoPicker
              images={images.filter((image) => !removed.includes(image.imageId))}
              files={files}
              failed={failed}
              locked={frozen}
              onFiles={(next) => setFiles((current) => [...current, ...next])}
              onRemoveStored={(imageId) => setRemoved((current) => [...current, imageId])}
              onRemoveFile={(file) => setFiles((current) => current.filter((item) => item !== file))}
            />
          </div>
        )}
        <div className="mt-3 flex items-center justify-end gap-2">
          <div className="flex gap-2">
            {step === 2 ? <Button variant="secondary" onClick={() => setStep(1)}>Back</Button> : null}
            {step === 1 ? <Button onClick={() => setStep(2)}>Next</Button> : null}
            {step === 2 && !locked ? (
              <Button disabled={saving} onClick={() => void save()}>{saving ? "Saving" : "Save"}</Button>
            ) : null}
          </div>
        </div>
        {confirmSold ? (
          <SoldConfirm
            onCancel={() => setConfirmSold(false)}
            onConfirm={() => {
              setForm({ ...form, isSold: true, isListed: false });
              setConfirmSold(false);
            }}
          />
        ) : null}
      </div>
    </>
  );
}
