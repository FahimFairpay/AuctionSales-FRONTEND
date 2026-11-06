"use client";

import { useState } from "react";
import type { FairentalImage } from "./fairentalApi";

export function Gallery({ images, title }: { images: FairentalImage[]; title: string }) {
  const ready = images.filter((image) => image.url);
  const [index, setIndex] = useState(0);
  const current = ready[index] || ready[0];
  if (!current) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-md border border-hairline bg-surface text-sm text-muted">
        No photo yet
      </div>
    );
  }
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current.url} alt={title} className="aspect-[16/10] w-full rounded-md border border-hairline object-cover" />
      {ready.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {ready.map((image, imageIndex) => (
            <button
              key={image.imageId}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border ${imageIndex === index ? "border-accent" : "border-hairline"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
