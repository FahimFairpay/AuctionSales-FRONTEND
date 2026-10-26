"use client";

import React from "react";
import Image from "next/image";
import type { InventoryItem } from "../types/api";
import { SourceCornerLabel } from "../features/inventory/SourceGlassPill";

export interface InventoryCardProps {
  item: InventoryItem;
  onOpenDetails?: (item: InventoryItem) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onOpenDetails }) => {
  const isCopart = item.source === "COPART";
  const stock = item.stockNumber || item.sourceId || "N/A";
  const outboundUrl =
    item.outboundAuctionUrl ||
    (isCopart
      ? `https://www.copart.com/lot/${stock}`
      : `https://www.iaai.com/VehicleDetail/${stock}`);

  const galleryLength = Array.isArray(item.gallery) ? item.gallery.length : 0;
  const isClean =
    item.cleanTitle ||
    item.titleCategory === "CLEAN" ||
    (item.titleDoc && item.titleDoc.toLowerCase().includes("clean"));

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-[var(--glass-card-shadow)]">
      {/* Thumbnail Container */}
      <div
        className="relative w-full h-52 bg-zinc-900 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails && onOpenDetails(item)}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={`${item.year || ""} ${item.make || ""} ${item.model || ""}`.trim()}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-zinc-600 text-sm">
            No Image Available
          </div>
        )}

        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <SourceCornerLabel source={item.source} />
          {isClean ? (
            <span className="rounded-full border border-white/70 bg-white/30 px-2 py-0.5 text-[10px] font-medium text-ink backdrop-blur-md">
              Clean Title
            </span>
          ) : null}
        </div>

        {/* Photo Count Pill */}
        {galleryLength > 0 && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {galleryLength}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-ink">
            {item.year} {item.make} {item.model}
          </h3>
          <p className="mt-1 flex items-center justify-between text-xs text-muted">
            <span>Lot #{stock}</span>
            <span>{item.odometer ? `${item.odometer.toLocaleString()} mi` : "Actual mi N/A"}</span>
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.primaryDamage && (
              <span className="rounded-full border border-hairline bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">
                {item.primaryDamage}
              </span>
            )}
            {item.startCode && (
              <span className="rounded-full border border-hairline bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">
                {item.startCode}
              </span>
            )}
            {item.state && (
              <span className="rounded-full border border-hairline bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">
                {item.state}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
          <button
            type="button"
            onClick={() => onOpenDetails && onOpenDetails(item)}
            className="text-xs font-semibold text-ink hover:text-accent"
          >
            View Analysis &rarr;
          </button>

          {/* Outbound Deep Link */}
          <a
            href={outboundUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white"
          >
            <span>Bid on {item.source || "IAAI"}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};
