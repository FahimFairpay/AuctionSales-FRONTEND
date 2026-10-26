"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface GalleryImage {
  sequence?: number;
  thumb?: string;
  large?: string;
  hd?: string;
}

export interface ImageGalleryProps {
  gallery?: Array<GalleryImage | string>;
  vehicleTitle?: string;
  primaryFallbackUrl?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  gallery,
  vehicleTitle = "Vehicle",
  primaryFallbackUrl = "",
}) => {
  // Normalize incoming photos from string[] or structured Copart lotImages objects
  const photos: string[] = React.useMemo(() => {
    if (!gallery || gallery.length === 0) {
      return primaryFallbackUrl ? [primaryFallbackUrl] : [];
    }
    return gallery
      .map((item) => {
        if (typeof item === "string") return item;
        return item.hd || item.large || item.thumb || "";
      })
      .filter((url) => Boolean(url));
  }, [gallery, primaryFallbackUrl]);

  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="w-full h-80 rounded-2xl bg-zinc-900/60 backdrop-blur-md flex items-center justify-center text-zinc-500 text-sm border border-white/10">
        No high-resolution photos available for this lot.
      </div>
    );
  }

  const activePhoto = photos[activeIndex] || photos[0];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main Full-Size Preview (Option 2A: Pre-warmed from DynamoDB) */}
      <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
        <Image
          src={activePhoto}
          alt={`${vehicleTitle} - Photo ${activeIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 1200px) 100vw, 800px"
          priority
          unoptimized
        />

        {/* Photo Navigation Overlay */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 active:scale-95"
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 active:scale-95"
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Photo Counter Pill */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-semibold text-white border border-white/10">
          {activeIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
          {photos.map((photoUrl, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                idx === activeIndex
                  ? "border-blue-500 scale-105 shadow-md shadow-blue-500/30 ring-1 ring-blue-400"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={photoUrl}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
