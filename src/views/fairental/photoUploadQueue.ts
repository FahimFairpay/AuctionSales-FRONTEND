"use client";

import { useEffect, useRef, useState } from "react";
import { issueFairentalPhotos, type PhotoTicket } from "./fairentalApi";

export type PhotoUploadProgress = {
  vin: string;
  version: string;
  total: number;
  done: number;
  failed: number;
  files: File[];
};

const PREPARE_SLOTS = 4;
const UPLOAD_SLOTS = 4;
const SHRINK_AT = 1.5 * 1024 * 1024;
const LONGEST_EDGE = 2560;

type PendingUpload = { file: File; ticket: PhotoTicket };

export function usePhotoUploadQueue() {
  const [progress, setProgress] = useState<PhotoUploadProgress[]>([]);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      const busy = progressRef.current.some((row) => row.done + row.failed < row.total);
      if (!busy) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  function enqueue(vin: string, version: string, files: File[]) {
    if (!files.length) return;
    setProgress((current) => [
      ...current.filter((row) => row.vin !== vin || row.version !== version),
      { vin, version, total: files.length, done: 0, failed: 0, files },
    ]);
    void run(vin, version, files, (done, failed) => {
      setProgress((current) => current.map((row) => (
        row.vin === vin && row.version === version ? { ...row, done, failed } : row
      )));
    });
  }

  function settle(vin: string, version: string) {
    setProgress((current) => current.filter((row) => row.vin !== vin || row.version !== version));
  }

  return { progress, enqueue, settle };
}

async function run(
  vin: string,
  version: string,
  files: File[],
  report: (done: number, failed: number) => void,
) {
  let done = 0;
  let failed = 0;
  const prepared: File[] = [];
  const waiting: PendingUpload[] = [];
  let flushing = false;
  let uploads = 0;
  let cursor = 0;

  function bump(ok: boolean) {
    if (ok) done += 1;
    else failed += 1;
    report(done, failed);
  }

  async function pump() {
    while (uploads < UPLOAD_SLOTS && waiting.length) {
      const job = waiting.shift();
      if (!job) return;
      uploads += 1;
      void postTicket(job).then((ok) => {
        bump(ok);
      }).finally(() => {
        uploads -= 1;
        void pump();
      });
    }
  }

  async function flush() {
    if (flushing || !prepared.length) return;
    flushing = true;
    const batch = prepared.splice(0, prepared.length);
    try {
      const issued = await issueFairentalPhotos(vin, version, batch.map((file) => ({
        contentType: file.type || "image/jpeg",
        bytes: file.size,
      })));
      batch.forEach((file, index) => {
        const ticket = issued.uploads?.[index];
        if (!ticket) {
          bump(false);
          return;
        }
        waiting.push({ file, ticket });
      });
    } catch {
      batch.forEach(() => bump(false));
    } finally {
      flushing = false;
      void pump();
      if (prepared.length) void flush();
    }
  }

  async function worker() {
    while (cursor < files.length) {
      const file = files[cursor];
      cursor += 1;
      try {
        prepared.push(await shrink(file));
        void flush();
      } catch {
        bump(false);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(PREPARE_SLOTS, files.length) }, () => worker()));
  await waitUntil(() => done + failed >= files.length && uploads === 0 && !flushing && waiting.length === 0 && prepared.length === 0);
}

async function postTicket(job: PendingUpload): Promise<boolean> {
  const ticket = job.ticket;
  try {
    await postOnce(job.file, ticket);
    return true;
  } catch {
    try {
      await postOnce(job.file, ticket);
      return true;
    } catch {
      return false;
    }
  }
}

async function postOnce(file: File, ticket: PhotoTicket) {
  const form = new FormData();
  Object.entries(ticket.upload.fields).forEach(([key, value]) => form.append(key, value));
  form.append("file", file);
  const response = await fetch(ticket.upload.url, { method: "POST", body: form });
  if (!response.ok) throw new Error("The photo could not be uploaded");
}

async function shrink(file: File): Promise<File> {
  if (file.size <= SHRINK_AT) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, LONGEST_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

function waitUntil(ready: () => boolean) {
  return new Promise<void>((resolve) => {
    const handle = window.setInterval(() => {
      if (!ready()) return;
      window.clearInterval(handle);
      resolve();
    }, 150);
  });
}
