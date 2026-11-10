"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/api/errors";
import { Button } from "@/components/Button";
import { IconTool } from "@/components/IconTool";
import {
  adminFairental,
  createFairental,
  patchFairental,
  type FairentalCard,
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

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_PHOTO = 1024;
const MAX_PHOTO = 12_582_912;
const MAX_PHOTOS = 20;

export type SavedCar = { vin: string; version: string; files: File[] };

const BLANK: CarForm = {
  vin: "", title: "", make: "", model: "", year: "", bodyStyle: "",
  exteriorColor: "", interiorColor: "", price: "", description: "",
  isListed: true, isSold: false,
};

function formFromCard(car: FairentalCard): CarForm {
  return {
    vin: car.vin,
    title: car.title || "",
    make: car.make || "",
    model: car.model || "",
    year: car.year ? String(car.year) : "",
    bodyStyle: car.bodyStyle || "",
    exteriorColor: car.exteriorColor || "",
    interiorColor: car.interiorColor || "",
    price: car.price ? String(car.price) : "",
    description: "",
    isListed: !!car.isListed,
    isSold: !!car.isSold,
  };
}

export function CarDialog({
  kind,
  vin,
  seed,
  onClose,
  onSaved,
}: {
  kind: Kind;
  vin?: string;
  seed?: FairentalCard;
  onClose: () => void;
  onSaved: (saved: SavedCar) => void;
}) {
  const editing = kind === "edit";
  const [form, setForm] = useState(editing && seed ? formFromCard(seed) : BLANK);
  const [step, setStep] = useState<1 | 2>(1);
  const [version, setVersion] = useState(editing ? seed?.version || "" : "");
  const [images, setImages] = useState<FairentalImage[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [locked, setLocked] = useState(editing && !!seed?.isSold);
  const [failed] = useState<string[]>([]);
  const [confirmSold, setConfirmSold] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const creating = !editing;
  const frozen = locked || form.isSold;
  const sellHere = editing && form.isSold && !locked && step === 1;
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

  function photoError(): string {
    const kept = images.filter((image) => !removed.includes(image.imageId)).length;
    if (creating && files.length === 0) return "Add at least one photo.";
    if (kept + files.length > MAX_PHOTOS) return "A car can hold 20 photos.";
    for (const file of files) {
      if (!PHOTO_TYPES.includes(file.type)) return "Photos must be JPEG, PNG, or WebP.";
      if (file.size < MIN_PHOTO || file.size > MAX_PHOTO) return "Each photo must be between 1 KB and 12 MB.";
    }
    return "";
  }

  async function save() {
    const selling = !creating && form.isSold;
    if (selling && (removed.length > 0 || files.length > 0)) {
      setError("A sold car keeps its photos.");
      return;
    }
    const invalid = photoError();
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = draft(form.isListed && !form.isSold);
      const saved = kind === "edit" && version
        ? await patchFairental(form.vin, version, selling ? payload : {
          ...payload,
          imageOrder: images.filter((image) => !removed.includes(image.imageId)).map((image) => image.imageId),
        })
        : await createFairental(payload);
      onSaved({ vin: saved.vin, version: saved.version, files });
    } catch (err: unknown) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
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
          <h2 id="fairental-car-title" className="min-w-0 break-words font-serif text-xl leading-tight text-ink">
            {creating && !heading ? "New car" : heading || "Car"}
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
            {step === 1 && !sellHere ? <Button onClick={() => setStep(2)}>Next</Button> : null}
            {(step === 2 && !locked) || sellHere ? (
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
