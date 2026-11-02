"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicInventoryItem } from "../../api/publicInventory";
import { FairOrb } from "../../components/orb/FairOrb";
import { CopilotDrawer } from "../../components/copilot/CopilotDrawer";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { InventoryThumb } from "../../features/inventory/InventoryThumb";
import { galleryShots } from "../../features/inventory/visImages";
import { LotFactGrid } from "../../features/inventory/LotFactGrid";
import { SHOWCASE_INVENTORY } from "../../features/inventory/showcaseData";
import { SourceCornerLabel, VehicleSourceTitle, listingUrl } from "../../features/inventory/SourceGlassPill";
import { paths } from "../../routes/paths";

export function PublicInventoryDetailPage() {
  const params = useParams();
  const stockNumber = (params?.stockNumber as string) || "";

  const itemQuery = useQuery({
    queryKey: ["public-inventory-item", stockNumber],
    queryFn: async () => {
      try {
        const live = await getPublicInventoryItem(stockNumber);
        if (live && live.stockNumber) return live;
      } catch {
        // Fallback to showcase inventory for preview
      }
      const found = SHOWCASE_INVENTORY.find((i) => i.stockNumber === stockNumber);
      if (found) return found;
      // If direct match not found, return first showcase item as demo
      return SHOWCASE_INVENTORY[0];
    },
    enabled: Boolean(stockNumber),
  });

  if (itemQuery.isLoading) {
    return (
      <div className="flex min-h-dvh flex-col bg-canvas text-ink">
        <PublicHeader mode="inventory" />
        <div className="public-page-frame flex flex-1 items-center justify-center">
          <FairOrb state="working" />
        </div>
      </div>
    );
  }

  const row = itemQuery.data || SHOWCASE_INVENTORY[0];
  const heading = row.title || row.stockNumber;

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-ink">
      <PublicHeader mode="inventory" />

      <main className="public-page-frame min-w-0 flex-1 space-y-3">
        <Link href={paths.publicInventory} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Inventory
        </Link>

        <VehicleSourceTitle title={heading} href={listingUrl(row)} />

        <div className="grid min-h-0 gap-5 lg:grid-cols-[minmax(24rem,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="relative overflow-hidden rounded-[8px]">
            <InventoryThumb
              src={row.imageUrl}
              title={row.title}
              shots={galleryShots(row.gallery)}
              className="aspect-[16/10] w-full rounded-[8px] border border-hairline lg:aspect-auto lg:h-[min(420px,48vh)] lg:max-h-[min(420px,48vh)]"
            />
            <div className="pointer-events-none absolute top-2 left-2 z-10">
              <SourceCornerLabel source={row.source} />
            </div>
          </div>

          <LotFactGrid item={row} />
        </div>

      </main>

      <CopilotDrawer publicDock />
    </div>
  );
}
