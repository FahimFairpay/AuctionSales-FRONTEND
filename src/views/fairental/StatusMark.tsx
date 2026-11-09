import type { MouseEvent } from "react";

const CHIP = {
  Listed: "bg-[#C8FF3D] text-[#102400]",
  Unlisted: "bg-[#FF2D3A] text-white",
  Sold: "bg-[#D8D8DE] text-[#3F3F46]",
};

export type CarStatus = keyof typeof CHIP;

export function carStatus(car: { isSold?: boolean; isListed?: boolean }): CarStatus {
  return car.isSold ? "Sold" : car.isListed ? "Listed" : "Unlisted";
}

export function StatusMark({
  status,
  onToggle,
  className = "",
}: {
  status: CarStatus;
  onToggle?: () => void;
  className?: string;
}) {
  const look = `inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ${CHIP[status]} ${className}`;
  if (!onToggle) return <span className={look}>{status}</span>;
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
      {status}
    </button>
  );
}
