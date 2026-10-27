"use client";

import { Link } from "@/compat/router";
import type { InventoryItem } from "../../types/api";
import { paths } from "../../routes/paths";
import { toInventorySearch, type InventoryQuery } from "./query";
import { InventoryThumb } from "./InventoryThumb";
import { galleryShots, type VisCandidate } from "./visImages";
import { formatFactLine, visibleTopics, type DisplayTopic } from "./displayTopics";
import { fieldLabel, type CardFieldId } from "./cardFields";
import { HeartFavoriteButton } from "./HeartFavoriteButton";
import { SourceCornerLabel } from "./SourceGlassPill";

export function InventoryLotList({
  items,
  query,
  fields,
  isFavorite,
  onToggleFavorite,
  hrefFor = paths.inventoryItem,
  loadGallery,
}: {
  items: InventoryItem[];
  query: InventoryQuery;
  fields: CardFieldId[];
  isFavorite?: (stockNumber: string, source?: string) => boolean;
  onToggleFavorite?: (item: InventoryItem) => void;
  hrefFor?: (stockNumber: string) => string;
  loadGallery?: (stockNumber: string) => Promise<VisCandidate[]>;
}) {
  const topics = visibleTopics(fields);
  const rest = topics.filter((topic) => topic.id !== "vehicle").length;
  const columns = `10rem minmax(14rem, 1.4fr) repeat(${rest}, minmax(10rem, 1fr))`;
  const suffix = toInventorySearch(query, false).toString();
  const stockHref = (stockNumber: string) => {
    const base = hrefFor(stockNumber);
    return suffix ? `${base}?${suffix}` : base;
  };
  return (
    <>
      {/* Mobile cards */}
      <ul className="space-y-3 lg:hidden">
        {items.map((item) => {
          const stockTo = stockHref(item.stockNumber);
          const heading = item.title || item.stockNumber;
          const loadShots = loadGallery ? () => loadGallery(item.stockNumber) : undefined;
          const facets = topics
            .flatMap((t) => t.fields)
            .map((id) => ({ line: formatFactLine(item, id), id }))
            .filter((f): f is { line: string; id: CardFieldId } => Boolean(f.line));
          return (
            <li key={item.stockNumber} className="relative">
              <Link
                to={stockTo}
                className="block overflow-hidden rounded-[8px] border border-hairline bg-surface hover:bg-surface-muted"
              >
                {/* Full-width image with title overlay */}
                <div className="relative">
                  <InventoryThumb
                    src={item.imageUrl}
                    title={item.title}
                    shots={galleryShots(item.gallery)}
                    loadShots={loadShots}
                    compact
                    className="aspect-[16/9] w-full"
                  />
                  {/* Title overlaid at bottom of image */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-6">
                    <p className="line-clamp-2 font-serif text-[15px] leading-5 tracking-[-0.02em] text-white">
                      {heading}
                    </p>
                  </div>
                  <div className="pointer-events-none absolute top-2 left-2 z-10">
                    <SourceCornerLabel source={item.source} />
                  </div>
                </div>
                {/* Facts below image in 2-col grid */}
                {facets.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-3 py-2.5">
                    {facets.map(({ line, id: fid }) => (
                      <p key={fid} className="truncate text-[12px] leading-4 text-muted" title={fieldLabel(fid)}>
                        {line}
                      </p>
                    ))}
                  </div>
                ) : null}
              </Link>
              {isFavorite && onToggleFavorite ? (
                <div className="absolute top-2 right-2 z-10">
                  <HeartFavoriteButton
                    stockNumber={item.stockNumber}
                    isFavorite={isFavorite(item.stockNumber, item.source)}
                    onToggle={() => onToggleFavorite(item)}
                    size="md"
                    className="rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 shadow-sm"
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {/* Desktop grid */}
      <div className="hidden overflow-x-auto lg:block">
        <div className="min-w-[60rem]">
          <InventoryLotHeader topics={topics} columns={columns} />
          <ul>
            {items.map((item) => (
              <li key={item.stockNumber}>
                <InventoryLotRow
                  item={item}
                  query={query}
                  topics={topics}
                  columns={columns}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                  hrefFor={hrefFor}
                  loadGallery={loadGallery}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export function InventoryLotHeader({
  topics,
  columns,
}: {
  topics: DisplayTopic[];
  columns: string;
}) {
  return (
    <div
      className="grid items-end gap-x-4 border-b border-hairline px-1 py-2"
      style={{ gridTemplateColumns: columns }}
    >
      <div />
      {topics.map((topic) => (
        <div key={topic.id} className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
          {topic.label}
        </div>
      ))}
    </div>
  );
}

export function InventoryLotRow({
  item,
  query,
  topics,
  columns,
  isFavorite,
  onToggleFavorite,
  hrefFor = paths.inventoryItem,
  loadGallery,
}: {
  item: InventoryItem;
  query: InventoryQuery;
  topics: DisplayTopic[];
  columns: string;
  isFavorite?: (stockNumber: string, source?: string) => boolean;
  onToggleFavorite?: (item: InventoryItem) => void;
  hrefFor?: (stockNumber: string) => string;
  loadGallery?: (stockNumber: string) => Promise<VisCandidate[]>;
}) {
  const suffix = toInventorySearch(query, false).toString();
  const base = hrefFor(item.stockNumber);
  const stockTo = suffix ? `${base}?${suffix}` : base;
  const heading = item.title || item.stockNumber;
  const loadShots = loadGallery ? () => loadGallery(item.stockNumber) : undefined;
  const titleClass =
    "text-balance font-serif text-[15px] leading-5 tracking-[-0.02em] text-ink hover:text-accent";
  return (
    <div
      className="group grid gap-x-4 border-b border-hairline px-1 py-3 hover:bg-surface-muted"
      style={{ gridTemplateColumns: columns }}
    >
      <div className="relative h-[100px] w-[160px] shrink-0">
        <Link to={stockTo} className="block">
          <InventoryThumb
            src={item.imageUrl}
            title={item.title}
            shots={galleryShots(item.gallery)}
            loadShots={loadShots}
            compact
            className="h-[100px] w-[160px] rounded-[6px]"
          />
        </Link>
        <div className="pointer-events-none absolute top-1.5 left-1.5 z-10">
          <SourceCornerLabel source={item.source} />
        </div>
        {isFavorite && onToggleFavorite ? (
          <div className="absolute top-1.5 right-1.5 z-10">
            <HeartFavoriteButton
              stockNumber={item.stockNumber}
              isFavorite={isFavorite(item.stockNumber, item.source)}
              onToggle={() => onToggleFavorite(item)}
              size="sm"
              className="rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 shadow-sm"
            />
          </div>
        ) : null}
      </div>
      {topics.map((topic) => (
        <div key={topic.id} className="min-w-0 space-y-0.5">
          {topic.id === "vehicle" ? (
            item.outboundAuctionUrl || item.detailLink ? (
              <a
                href={item.outboundAuctionUrl || item.detailLink}
                target="_blank"
                rel="noreferrer"
                className={titleClass}
                title="Vehicle"
              >
                {heading}
              </a>
            ) : (
              <Link to={stockTo} className={titleClass} title="Vehicle">
                {heading}
              </Link>
            )
          ) : null}
          <Link to={stockTo} className="block space-y-0.5">
            {topic.fields.map((id) => {
              const line = formatFactLine(item, id);
              if (!line) {
                return null;
              }
              return (
                <p key={id} className={`text-[13px] leading-5 text-ink ${id === "vin" ? "break-all" : "truncate"}`} title={`${fieldLabel(id)}: ${line}`}>
                  {line}
                </p>
              );
            })}
          </Link>
        </div>
      ))}
    </div>
  );
}
