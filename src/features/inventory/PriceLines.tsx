import type { InventoryItem } from "../../types/api";
import { EstimateNote } from "./EstimateNote";

function dollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function range(low?: number, high?: number): string | null {
  if (typeof low !== "number" || typeof high !== "number" || !Number.isFinite(low) || !Number.isFinite(high)) {
    return null;
  }
  if (low === high) {
    return dollars(low);
  }
  return `${dollars(low)}–${dollars(high)}`;
}

function readyPrices(item: InventoryItem) {
  if (!item.estimateStatus) {
    return null;
  }
  if (item.estimateStatus !== "ready") {
    return "unavailable" as const;
  }
  const onRoad = range(item.onRoadLow, item.onRoadHigh);
  const market = range(item.marketLow, item.marketHigh);
  const savings = range(item.savingsLow, item.savingsHigh);
  if (!onRoad || !market || !savings) {
    return "unavailable" as const;
  }
  return { onRoad, market, savings };
}

export function PriceLines({ item, tone = "column" }: { item: InventoryItem; tone?: "column" | "panel" }) {
  const prices = readyPrices(item);
  if (!prices) {
    return null;
  }
  if (prices === "unavailable") {
    return <p className="text-[13px] leading-5 text-muted">Unavailable</p>;
  }
  if (tone === "panel") {
    return <PricePanel onRoad={prices.onRoad} market={prices.market} savings={prices.savings} />;
  }
  return <PriceColumn onRoad={prices.onRoad} market={prices.market} savings={prices.savings} />;
}

function PriceColumn({ onRoad, market, savings }: { onRoad: string; market: string; savings: string }) {
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="flex items-baseline justify-between gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Savings</span>
        <span className="shrink-0 text-[18px] font-bold leading-[22px] tracking-[-0.01em] whitespace-nowrap tabular-nums text-ink" title={savings}>
          {savings}
        </span>
      </div>
      <div className="flex flex-col gap-px pt-px">
        <div className="flex items-baseline justify-between gap-1.5 text-[12px] leading-[17px]">
          <span className="inline-flex items-center gap-1 text-[13px] leading-[19px] text-muted">
            On road:
            <EstimateNote />
          </span>
          <span className="shrink-0 font-semibold whitespace-nowrap tabular-nums text-ink" title={onRoad}>
            {onRoad}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-1.5 text-[12px] leading-[17px]">
          <span className="text-[13px] leading-[19px] text-muted">Market price:</span>
          <span className="shrink-0 whitespace-nowrap tabular-nums text-muted line-through" title={market}>
            {market}
          </span>
        </div>
      </div>
    </div>
  );
}

function PricePanel({ onRoad, market, savings }: { onRoad: string; market: string; savings: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Savings</p>
        <p className="mt-0.5 text-[22px] font-bold leading-none tracking-[-0.02em] whitespace-nowrap tabular-nums text-ink" title={savings}>
          {savings}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1 text-[12px] leading-4 text-muted">
            On road
            <EstimateNote />
          </p>
          <p className="mt-0.5 text-[13px] font-semibold leading-5 whitespace-nowrap tabular-nums text-ink" title={onRoad}>
            {onRoad}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[12px] leading-4 text-muted">Market price</p>
          <p className="mt-0.5 text-[13px] leading-5 whitespace-nowrap tabular-nums text-muted line-through" title={market}>
            {market}
          </p>
        </div>
      </div>
    </div>
  );
}
