"use client";

import type { MouseEvent } from "react";

const CHIP = {
  Listed: "bg-[#30D158] text-[#04210C] shadow-[0_0_0_1px_#30D158,0_0_16px_rgba(48,209,88,0.95)]",
  Unlisted: "bg-[#FF453A] text-white shadow-[0_0_0_1px_#FF453A,0_0_16px_rgba(255,69,58,0.9)]",
  Sold: "bg-[#D1D1D6] text-[#1C1C1E] shadow-[0_0_0_1px_#F2F2F7,0_0_16px_rgba(242,242,247,0.95)]",
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
