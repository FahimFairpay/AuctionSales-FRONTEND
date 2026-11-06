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
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] text-[var(--fs-muted)]">Photos</p>
        {locked ? null : (
          <label className="cursor-pointer text-[12px] text-[var(--fs-claude-orange)]">
            Add
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
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image) => (
          <figure key={image.imageId} className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--fs-paper)]">
            {image.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[11px] text-[var(--fs-muted)]">
                {failed.includes(image.imageId) ? "Failed" : "Waiting"}
              </div>
            )}
            {locked ? null : (
              <button type="button" onClick={() => onRemoveStored(image.imageId)} className="absolute right-1 top-1 rounded-full bg-[var(--fs-paper-elevated)] px-1.5 text-[11px]" aria-label="Remove photo">
                ×
              </button>
            )}
          </figure>
        ))}
        {files.map((file) => (
          <figure key={file.name} className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--fs-paper)] p-2 text-center text-[11px] text-[var(--fs-muted)]">
            {file.name}
          </figure>
        ))}
      </div>
    </div>
  );
}
