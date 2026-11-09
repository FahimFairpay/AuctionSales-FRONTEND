"use client";

import type { MouseEvent } from "react";

const CHIP = {
  Listed: "bg-[#168F48] text-white shadow-[0_0_0_1px_#0E6B34,0_1px_2px_rgba(0,0,0,0.45)]",
  Unlisted: "bg-[#E03138] text-white shadow-[0_0_0_1px_#B42328,0_1px_2px_rgba(0,0,0,0.45)]",
  Sold: "bg-[#E4E4EA] text-[#2E2E36] shadow-[0_0_0_1px_#C8C8D0,0_1px_2px_rgba(0,0,0,0.35)]",
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
  const look = `inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2.5 text-[10px] font-semibold leading-none tracking-[0.08em] transition-[background-color,box-shadow,color] duration-200 ease-out ${CHIP[status]}`;
  const label = status.toUpperCase();
  if (!onToggle) return <span className={look}>{label}</span>;
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
      {label}
    </button>
  );
}
