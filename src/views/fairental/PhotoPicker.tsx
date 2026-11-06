"use client";

import type { FairentalImage } from "./fairentalApi";

export function PhotoPicker({
  images,
  files,
  failed,
  locked,
  onFiles,
  onRemoveStored,
}: {
  images: FairentalImage[];
  files: File[];
  failed: string[];
  locked?: boolean;
  onFiles: (files: File[]) => void;
  onRemoveStored: (imageId: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {locked ? null : (
        <label className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-hairline bg-surface-muted text-muted hover:text-ink">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Add photos</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => {
              onFiles(Array.from(event.target.files || []));
              event.target.value = "";
            }}
          />
        </label>
      )}
      {images.map((image) => (
        <figure key={image.imageId} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-hairline bg-surface-muted">
          {image.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted">
              {failed.includes(image.imageId) ? "Failed" : "Waiting"}
            </div>
          )}
          {locked ? null : (
            <button
              type="button"
              onClick={() => onRemoveStored(image.imageId)}
              className="absolute right-0.5 top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-hairline bg-surface text-xs text-ink"
              aria-label="Remove photo"
            >
              ×
            </button>
          )}
        </figure>
      ))}
      {files.map((file) => (
        <figure key={`${file.name}-${file.size}`} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-muted p-1 text-center text-[10px] leading-tight text-muted">
          {file.name}
        </figure>
      ))}
    </div>
  );
}