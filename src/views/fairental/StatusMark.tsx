"use client";

import type { MouseEvent } from "react";

const CHIP = {
  Listed: "bg-[#C6FF3D] text-[#102000] shadow-[0_0_0_1px_#C6FF3D,0_0_12px_rgba(198,255,61,0.9)]",
  Unlisted: "bg-[#FF2A38] text-white shadow-[0_0_0_1px_#FF2A38,0_0_12px_rgba(255,42,56,0.8)]",
  Sold: "bg-[#E4E4EA] text-[#2A2A32] shadow-[0_0_0_1px_rgba(255,255,255,0.45)]",
};

export type CarStatus = keyof typeof CHIP;

export function carStatus(car: { isSold?: boolean; isListed?: boolean }): CarStatus {
  return car.isSold ? "Sold" : car.isListed ? "Listed" : "Unlisted";
}

export function StatusMark({
  status,
  onToggle,
}: {
  status: CarStatus;
  onToggle?: () => void;
}) {
  const look = `inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-full px-2 text-[11px] font-semibold leading-none tracking-[0.01em] ${CHIP[status]}`;
  const dot = <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />;
  if (!onToggle) {
    return (
      <span className={look}>
        {dot}
        {status}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={look}
      aria-label={status === "Listed" ? "Unlist this car" : "List this car"}
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      {dot}
      {status}
    </button>
  );
}
