"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "@/compat/router";
import { getInventoryItem } from "../../api/inventory";
import { Card } from "../../components/Card";
import { FairOrb } from "../../components/orb/FairOrb";
import { ImageGallery } from "../../components/ImageGallery";
import { CARD_GROUPS, formatCardValue } from "../../features/inventory/cardFields";
import { InventoryThumb } from "../../features/inventory/InventoryThumb";
import { SourceCornerLabel } from "../../features/inventory/SourceGlassPill";
import { PhonePromptModal } from "../../features/inventory/PhonePromptModal";
import { useFavorites } from "../../features/inventory/useFavorites";
import { paths } from "../../routes/paths";

export function InventoryDetailPage() {
  const { stockNumber = "" } = useParams();
  const location = useLocation();
  const back = `${paths.inventory}${location.search}`;
  const [phonePromptOpen, setPhonePromptOpen] = useState(false);

  const favorites = useFavorites({
    onPhoneRequired: () => setPhonePromptOpen(true),
  });

  const item = useQuery({
    queryKey: ["inventory-item", stockNumber],
    queryFn: () => getInventoryItem(stockNumber),
    enabled: Boolean(stockNumber),
  });

  if (item.isLoading) {
    return <FairOrb state="working" />;
  }
  if (item.error || !item.data) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-danger">{item.error?.message || "This lot is no longer live."}</p>
        <Link to={back} className="text-sm text-accent">
          Back to inventory
        </Link>
      </Card>
    );
  }
  const row = item.data;
  const heading = row.title || row.stockNumber;
  const isFav = favorites.isFavorite(row.stockNumber, row.source);

  return (
    <div className="space-y-3 lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-hidden">
      <Link to={back} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Inventory
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-balance font-serif text-[28px] leading-9 tracking-[-0.03em] lg:text-[40px] lg:leading-[1.15]">
          {row.outboundAuctionUrl || row.detailLink ? (
            <a
              href={row.outboundAuctionUrl || row.detailLink}
              target="_blank"
              rel="noreferrer"
              className="text-ink hover:text-accent"
            >
              {heading}
            </a>
          ) : (
            heading
          )}
        </h1>
      </div>
      <div className="grid min-h-0 gap-5 lg:grid-cols-[minmax(24rem,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div className="relative group/thumb overflow-hidden rounded-[8px]">
          {row.gallery && row.gallery.length > 0 ? (
            <ImageGallery gallery={row.gallery} vehicleTitle={heading} primaryFallbackUrl={row.imageUrl} />
          ) : (
            <InventoryThumb
              src={row.imageUrl}
              title={row.title}
              className="aspect-[16/10] w-full rounded-[8px] border border-hairline lg:aspect-auto lg:h-[min(420px,48vh)] lg:max-h-[min(420px,48vh)]"
            />
          )}
          <div className="absolute top-2 left-2 z-10">
            <SourceCornerLabel source={row.source} />
          </div>
          <button
            type="button"
            onClick={() => {
              void favorites.toggle(row.stockNumber, {
                source: row.source,
                title: row.title,
                imageUrl: row.imageUrl,
                vin: row.vin,
                branch: row.branch,
                auctionDate: row.auctionDate,
                auctionAt: row.auctionAt,
                currentBid: row.currentBid,
                acv: row.acv,
                primaryDamage: row.primaryDamage,
              });
            }}
            aria-label={isFav ? "Remove from interested" : "Mark as interested"}
            title={isFav ? "Marked interested (Admins notified)" : "Express interest in this vehicle"}
            className={`absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer ${
              isFav
                ? "bg-[#c4673a] text-white shadow-[#c4673a]/40 scale-105"
                : "bg-black/55 text-white/90 hover:bg-black/80 hover:text-white hover:scale-110"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 transition-transform duration-200 ${
                isFav ? "fill-white text-white scale-110" : "fill-none text-white stroke-white"
              }`}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="grid min-h-0 grid-cols-2 gap-x-5 gap-y-4 xl:grid-cols-4">
          {CARD_GROUPS.map((group) => {
            const facts = group.fields
              .map((field) => ({ field, value: formatCardValue(row, field.id) }))
              .filter((fact) => fact.value !== "—");
            if (facts.length === 0) {
              return null;
            }
            return (
              <section key={group.id} className="min-w-0 space-y-2">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{group.label}</h2>
                <dl className="space-y-2">
                  {facts.map(({ field, value }) => (
                    <div key={field.id} className="min-w-0">
                      <dt className="text-xs text-muted">{field.label}</dt>
                      <dd className="break-words text-[15px] leading-5 text-ink" title={value}>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      </div>
      <PhonePromptModal
        open={phonePromptOpen}
        onClose={() => setPhonePromptOpen(false)}
        onSuccess={() => {
          void favorites.toggle(row.stockNumber, {
            title: row.title,
            imageUrl: row.imageUrl,
            vin: row.vin,
            branch: row.branch,
            auctionDate: row.auctionDate,
            auctionAt: row.auctionAt,
            currentBid: row.currentBid,
            acv: row.acv,
            primaryDamage: row.primaryDamage,
          });
        }}
      />
    </div>
  );
}
