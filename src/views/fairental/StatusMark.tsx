"use client";

import type { MouseEvent } from "react";

const CHIP = {
  Listed: "bg-[#2BFF6A] text-[#04210E] shadow-[0_1px_2px_rgba(0,0,0,0.35),0_0_14px_rgba(43,255,106,0.9)]",
  Unlisted: "bg-[#FF2D3A] text-white shadow-[0_1px_2px_rgba(0,0,0,0.35),0_0_14px_rgba(255,45,58,0.85)]",
  Sold: "bg-[#E4E4EE] text-[#2A2A32] shadow-[0_1px_2px_rgba(0,0,0,0.28),0_0_14px_rgba(228,228,238,0.95)]",
};

const TYPE = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
  const look = `inline-flex h-7 items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium leading-none tracking-[-0.011em] transition-[background-color,box-shadow,color] duration-200 ease-out ${CHIP[status]}`;
  if (!onToggle) return <span className={look} style={TYPE}>{status}</span>;
  return (
    <button
      type="button"
      className={look}
      style={TYPE}
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
