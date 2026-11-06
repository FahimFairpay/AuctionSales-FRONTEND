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
        <p className="text-sm font-medium text-ink">Photos</p>
        {locked ? null : (
          <label className="cursor-pointer text-sm text-accent">
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
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-hairline bg-surface text-ink"
                aria-label="Remove photo"
              >
                ×
              </button>
            )}
          </figure>
        ))}
        {files.map((file) => (
          <figure key={file.name} className="flex aspect-square items-center justify-center rounded-md border border-hairline bg-surface-muted p-2 text-center text-xs text-muted">
            {file.name}
          </figure>
        ))}
      </div>
    </div>
  );
}