"use client";

import { useEffect, useState } from "react";
import type { FairentalImage } from "./fairentalApi";

const ACCEPT = "image/jpeg,image/png,image/webp";

export function PhotoPicker({
  images,
  files,
  failed,
  locked,
  onFiles,
  onRemoveStored,
  onRemoveFile,
}: {
  images: FairentalImage[];
  files: File[];
  failed: string[];
  locked?: boolean;
  onFiles: (files: File[]) => void;
  onRemoveStored: (imageId: string) => void;
  onRemoveFile: (file: File) => void;
}) {
  const [over, setOver] = useState(false);

  function take(list: FileList | null) {
    const next = Array.from(list || []).filter((file) => /image\/(jpeg|png|webp)/.test(file.type));
    if (next.length) onFiles(next);
  }

  return (
    <div className="space-y-3">
      {locked ? null : (
        <label
          className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed px-4 py-5 text-center ${over ? "border-ink bg-surface-muted text-ink" : "border-hairline bg-surface text-muted"}`}
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setOver(false);
            take(event.dataTransfer.files);
          }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 16V6M8 9l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 18h14" strokeLinecap="round" />
          </svg>
          <span className="mt-2 text-sm text-ink">Drop photos here, or browse</span>
          <span className="mt-1 text-xs text-muted">JPEG, PNG, or WebP</span>
          <input
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => {
              take(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      )}
      {images.length || files.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image) => (
            <figure key={image.imageId} className="relative aspect-square overflow-hidden rounded-md border border-hairline bg-surface-muted">
              {image.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-1 text-center text-xs text-muted">
                  {failed.includes(image.imageId) ? "Failed" : "Waiting"}
                </div>
              )}
              {locked ? null : (
                <button
                  type="button"
                  onClick={() => onRemoveStored(image.imageId)}
                  className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-hairline bg-surface text-sm text-ink"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              )}
            </figure>
          ))}
          {files.map((file) => (
            <FileThumb key={`${file.name}-${file.size}-${file.lastModified}`} file={file} onRemove={() => onRemoveFile(file)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FileThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return (
    <figure className="relative aspect-square overflow-hidden rounded-md border border-hairline bg-surface-muted">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-hairline bg-surface text-sm text-ink"
        aria-label={`Remove ${file.name}`}
      >
        ×
      </button>
    </figure>
  );
}
