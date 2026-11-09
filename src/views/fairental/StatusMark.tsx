"use client";

import type { MouseEvent } from "react";

const CHIP = {
  Listed: "bg-[#00E25B] text-[#04210E] shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_16px_rgba(0,226,91,0.95)]",
  Unlisted: "bg-[#FF3142] text-white shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_14px_rgba(255,49,66,0.8)]",
  Sold: "bg-[#E4E4EA] text-[#2E2E36] shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
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
  const look = `inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold leading-none transition-[background-color,box-shadow,color] duration-200 ease-out ${CHIP[status]}`;
  if (!onToggle) return <span className={look}>{status}</span>;
  return (
    <button
      type="button"
      className={look}
      aria-label={status === "Listed" ? "Unlist this car" : "List this car"}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      {status}
    </button>
  );
}
